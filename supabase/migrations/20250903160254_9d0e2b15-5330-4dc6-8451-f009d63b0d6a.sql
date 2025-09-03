-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  business_type TEXT CHECK (business_type IN ('venue', 'club')),
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create venues table
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  genre TEXT NOT NULL,
  venue_type TEXT CHECK (venue_type IN ('Venue', 'Club')) NOT NULL,
  distance TEXT,
  subscription_plan TEXT CHECK (subscription_plan IN ('standard', 'premium')) DEFAULT 'standard',
  venue_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  genre TEXT NOT NULL,
  attendees INTEGER DEFAULT 0,
  max_attendees INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for venues  
CREATE POLICY "Venue owners can manage their venues" ON public.venues
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Everyone can view venues" ON public.venues
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create venues" ON public.venues
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- RLS Policies for events
CREATE POLICY "Venue owners can manage their events" ON public.events
  FOR ALL USING (
    venue_id IN (
      SELECT id FROM public.venues WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view events" ON public.events
  FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, business_type, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'New User'),
    NEW.raw_user_meta_data ->> 'business_type',
    NEW.raw_user_meta_data ->> 'address'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample venue data
INSERT INTO public.venues (owner_id, name, address, latitude, longitude, genre, venue_type, distance, venue_code) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Club Cajke', 'Downtown Zagreb', 45.815, 15.981, 'Cajke', 'Club', '0.5km', 'CLUB001'),
  ('00000000-0000-0000-0000-000000000001', 'Trash Disco', 'Upper Town Zagreb', 45.813, 15.977, 'Trash', 'Club', '0.8km', 'CLUB002'),
  ('00000000-0000-0000-0000-000000000001', 'Pop Palace', 'New Zagreb', 45.810, 15.982, 'White Girl Music', 'Club', '1.2km', 'CLUB003'),
  ('00000000-0000-0000-0000-000000000001', 'Techno Temple', 'Maksimir', 45.817, 15.983, 'Techno', 'Club', '0.7km', 'CLUB004'),
  ('00000000-0000-0000-0000-000000000001', 'Hip Hop Haven', 'Trnje', 45.814, 15.979, 'Hip Hop', 'Club', '0.9km', 'CLUB005'),
  ('00000000-0000-0000-0000-000000000001', 'Rock Republic', 'Dubrava', 45.812, 15.980, 'Rock', 'Venue', '1.0km', 'VEN001'),
  ('00000000-0000-0000-0000-000000000001', 'Rap Tavern', 'Črnomerec', 45.816, 15.984, 'Rap', 'Venue', '0.6km', 'VEN002'),
  ('00000000-0000-0000-0000-000000000001', 'Dance Arena', 'Sesvete', 45.818, 15.986, 'Dance', 'Venue', '1.1km', 'VEN003'),
  ('00000000-0000-0000-0000-000000000001', 'Jazz Corner', 'Peščenica', 45.811, 15.978, 'Jazz', 'Venue', '0.7km', 'VEN004');