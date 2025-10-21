-- Drop the insecure UPDATE policy on subscribers
DROP POLICY IF EXISTS "Update subscription" ON public.subscribers;

-- Create a new policy that allows users to only update their own subscription
CREATE POLICY "Users can update their own subscription"
ON public.subscribers
FOR UPDATE
USING ((user_id = auth.uid()) OR (email = auth.email()));