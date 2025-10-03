import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Check, X, Clock } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';

interface ChatRequestButtonProps {
  userId: string;
}

const ChatRequestButton: React.FC<ChatRequestButtonProps> = ({ userId }) => {
  const { user } = useAuth();
  const { requests, sendChatRequest } = useChat();
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted' | 'declined'>('none');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if there's an existing request between these users
    const existingRequest = requests.find(
      req => 
        (req.sender_id === user?.id && req.receiver_id === userId) ||
        (req.receiver_id === user?.id && req.sender_id === userId)
    );

    if (existingRequest) {
      setRequestStatus(existingRequest.status);
    } else {
      setRequestStatus('none');
    }
  }, [requests, user, userId]);

  const handleSendRequest = async () => {
    setIsLoading(true);
    await sendChatRequest(userId);
    setIsLoading(false);
  };

  if (requestStatus === 'accepted') {
    return (
      <Button variant="default" className="gap-2" disabled>
        <Check className="w-4 h-4" />
        Chat Active
      </Button>
    );
  }

  if (requestStatus === 'pending') {
    return (
      <Button variant="secondary" className="gap-2" disabled>
        <Clock className="w-4 h-4" />
        Request Pending
      </Button>
    );
  }

  if (requestStatus === 'declined') {
    return (
      <Button variant="ghost" className="gap-2" disabled>
        <X className="w-4 h-4" />
        Request Declined
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      className="gap-2"
      onClick={handleSendRequest}
      disabled={isLoading}
    >
      <MessageCircle className="w-4 h-4" />
      Request to Chat
    </Button>
  );
};

export default ChatRequestButton;
