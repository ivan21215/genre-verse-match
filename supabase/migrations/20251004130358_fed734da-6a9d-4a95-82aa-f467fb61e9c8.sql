-- Add city/region field to venues for easier regional grouping
ALTER TABLE venues ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS region text;

-- Add user location tracking to reviews (to know where the review came from)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_latitude numeric;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_longitude numeric;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_city text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_region text;

-- Add user location tracking to event_rsvps (to know where the RSVP came from)
ALTER TABLE event_rsvps ADD COLUMN IF NOT EXISTS user_latitude numeric;
ALTER TABLE event_rsvps ADD COLUMN IF NOT EXISTS user_longitude numeric;
ALTER TABLE event_rsvps ADD COLUMN IF NOT EXISTS user_city text;
ALTER TABLE event_rsvps ADD COLUMN IF NOT EXISTS user_region text;

-- Create function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  r numeric := 6371; -- Earth's radius in kilometers
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * asin(sqrt(a));
  RETURN r * c;
END;
$$;