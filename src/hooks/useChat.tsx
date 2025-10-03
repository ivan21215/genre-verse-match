import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender_profile?: {
    name: string;
  };
  receiver_profile?: {
    name: string;
  };
}

export interface ChatMessage {
  id: string;
  request_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export const useChat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChatRequests = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_requests')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile names separately
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (req) => {
          const [senderProfile, receiverProfile] = await Promise.all([
            supabase.from('profiles').select('name').eq('user_id', req.sender_id).single(),
            supabase.from('profiles').select('name').eq('user_id', req.receiver_id).single()
          ]);

          return {
            ...req,
            sender_profile: senderProfile.data,
            receiver_profile: receiverProfile.data
          };
        })
      );

      setRequests(requestsWithProfiles as ChatRequest[]);
    } catch (error) {
      console.error('Error fetching chat requests:', error);
      toast({
        title: "Error",
        description: "Failed to load chat requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('chat_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_requests',
          filter: `sender_id=eq.${user?.id},receiver_id=eq.${user?.id}`
        },
        () => {
          fetchChatRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const sendChatRequest = async (receiverId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('chat_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Request already sent",
            description: "You've already sent a chat request to this user",
          });
        } else {
          throw error;
        }
        return { error: error.message };
      }

      toast({
        title: "Request sent",
        description: "Your chat request has been sent",
      });

      await fetchChatRequests();
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send request';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  const respondToChatRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('chat_requests')
        .update({ status: accept ? 'accepted' : 'declined' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: accept ? "Request accepted" : "Request declined",
        description: accept ? "You can now chat with this user" : "Chat request declined",
      });

      await fetchChatRequests();
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to respond';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  return {
    requests,
    loading,
    sendChatRequest,
    respondToChatRequest,
    refreshRequests: fetchChatRequests,
  };
};

export const useChatMessages = (requestId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!requestId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    if (!requestId) return;

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`messages_${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `request_id=eq.${requestId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  const sendMessage = async (message: string) => {
    if (!user || !requestId) return { error: 'Not authenticated or no chat selected' };

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          request_id: requestId,
          sender_id: user.id,
          message
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refreshMessages: fetchMessages,
  };
};
