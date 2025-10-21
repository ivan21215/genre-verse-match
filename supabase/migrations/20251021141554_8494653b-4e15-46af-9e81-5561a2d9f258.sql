-- Drop the existing public SELECT policy on event_rsvps
DROP POLICY IF EXISTS "Users can view all RSVPs" ON public.event_rsvps;

-- Create a new policy that allows users to only view their own RSVPs
CREATE POLICY "Users can view their own RSVPs"
ON public.event_rsvps
FOR SELECT
USING (auth.uid() = user_id);