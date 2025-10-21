-- Fix 1: Recreate public_reviews view with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_reviews;

CREATE VIEW public.public_reviews
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  venue_id,
  rating,
  comment,
  created_at,
  updated_at
FROM public.reviews;

GRANT SELECT ON public.public_reviews TO authenticated, anon;

-- Fix 2: Implement proper role-based access control
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('venue_owner', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create SECURITY DEFINER function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Migrate existing users from business_type to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  user_id,
  CASE 
    WHEN business_type IN ('venue', 'club') THEN 'venue_owner'::app_role
    ELSE 'user'::app_role
  END as role
FROM public.profiles
WHERE business_type IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Update RLS policies on venues table to use has_role()
DROP POLICY IF EXISTS "Authenticated users can create venues" ON public.venues;
DROP POLICY IF EXISTS "Venue owners can manage their venues" ON public.venues;

CREATE POLICY "Venue owners can create venues"
ON public.venues
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'venue_owner') AND owner_id = auth.uid());

CREATE POLICY "Venue owners can update their venues"
ON public.venues
FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Venue owners can delete their venues"
ON public.venues
FOR DELETE
USING (owner_id = auth.uid());

-- Update RLS policies on events table to use has_role()
DROP POLICY IF EXISTS "Venue owners can manage their events" ON public.events;

CREATE POLICY "Venue owners can insert their events"
ON public.events
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'venue_owner') AND
  venue_id IN (SELECT id FROM public.venues WHERE owner_id = auth.uid())
);

CREATE POLICY "Venue owners can update their events"
ON public.events
FOR UPDATE
USING (venue_id IN (SELECT id FROM public.venues WHERE owner_id = auth.uid()));

CREATE POLICY "Venue owners can delete their events"
ON public.events
FOR DELETE
USING (venue_id IN (SELECT id FROM public.venues WHERE owner_id = auth.uid()));

-- Update RLS policy on event_tickets
DROP POLICY IF EXISTS "Venue owners can manage their event tickets" ON public.event_tickets;

CREATE POLICY "Venue owners can manage their event tickets"
ON public.event_tickets
FOR ALL
USING (
  event_id IN (
    SELECT e.id FROM public.events e
    JOIN public.venues v ON e.venue_id = v.id
    WHERE v.owner_id = auth.uid()
  )
);

-- Update profiles table RLS to prevent business_type modification after initial setup
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (except business_type)"
ON public.profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND business_type = (SELECT business_type FROM public.profiles WHERE user_id = auth.uid()));

-- Update venue_analytics RLS
DROP POLICY IF EXISTS "Venue owners can view their analytics" ON public.venue_analytics;

CREATE POLICY "Venue owners can view their analytics"
ON public.venue_analytics
FOR SELECT
USING (
  venue_id IN (
    SELECT id FROM public.venues WHERE owner_id = auth.uid()
  )
);