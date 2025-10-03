import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, MessageCircle } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import LoadingIndicator from '@/components/LoadingIndicator';

interface ChatRequestsListProps {
  onChatSelect?: (requestId: string) => void;
}

const ChatRequestsList: React.FC<ChatRequestsListProps> = ({ onChatSelect }) => {
  const { user } = useAuth();
  const { requests, loading, respondToChatRequest } = useChat();

  if (loading) {
    return <LoadingIndicator />;
  }

  const pendingRequests = requests.filter(
    req => req.receiver_id === user?.id && req.status === 'pending'
  );

  const acceptedChats = requests.filter(
    req => req.status === 'accepted'
  );

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Chat Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {request.sender_profile?.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    wants to chat with you
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => respondToChatRequest(request.id, true)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respondToChatRequest(request.id, false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {acceptedChats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Chats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {acceptedChats.map((request) => {
              const otherUser = request.sender_id === user?.id 
                ? request.receiver_profile 
                : request.sender_profile;

              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onChatSelect?.(request.id)}
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <p className="font-medium">
                      {otherUser?.name || 'Unknown User'}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    Open Chat
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {pendingRequests.length === 0 && acceptedChats.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No chat requests or active chats yet</p>
            <p className="text-sm mt-1">
              Send a chat request from the Find Matches page
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatRequestsList;
