-- Create chat_requests table for managing chat consent
CREATE TABLE chat_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES chat_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_requests
CREATE POLICY "Users can create chat requests"
  ON chat_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their chat requests"
  ON chat_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Receivers can update chat requests"
  ON chat_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their chats"
  ON chat_messages FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM chat_requests 
      WHERE (sender_id = auth.uid() OR receiver_id = auth.uid()) 
      AND status = 'accepted'
    )
  );

CREATE POLICY "Users can send messages in accepted chats"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    request_id IN (
      SELECT id FROM chat_requests 
      WHERE (sender_id = auth.uid() OR receiver_id = auth.uid()) 
      AND status = 'accepted'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_chat_requests_updated_at
  BEFORE UPDATE ON chat_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_requests;