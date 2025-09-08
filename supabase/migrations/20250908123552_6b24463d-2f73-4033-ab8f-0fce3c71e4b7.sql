-- Create storage bucket for venue images
INSERT INTO storage.buckets (id, name, public) VALUES ('venue-images', 'venue-images', true);

-- Create storage policies for venue images
CREATE POLICY "Anyone can view venue images" ON storage.objects
FOR SELECT USING (bucket_id = 'venue-images');

CREATE POLICY "Authenticated users can upload venue images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'venue-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Venue owners can update their venue images" ON storage.objects
FOR UPDATE USING (bucket_id = 'venue-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Venue owners can delete their venue images" ON storage.objects
FOR DELETE USING (bucket_id = 'venue-images' AND auth.uid() IS NOT NULL);

-- Add image_url column to venues table
ALTER TABLE public.venues ADD COLUMN image_url TEXT;

-- Create event_rsvps table for RSVP system
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS on event_rsvps
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Create policies for event_rsvps
CREATE POLICY "Users can view all RSVPs" ON public.event_rsvps
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own RSVPs" ON public.event_rsvps
FOR ALL USING (auth.uid() = user_id);

-- Create user_favorites table for bookmarks
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, venue_id)
);

-- Enable RLS on user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user_favorites
CREATE POLICY "Users can view their own favorites" ON public.user_favorites
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON public.user_favorites
FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_event_rsvps_updated_at
BEFORE UPDATE ON public.event_rsvps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user_id ON public.event_rsvps(user_id);
CREATE INDEX idx_user_favorites_venue_id ON public.user_favorites(venue_id);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);