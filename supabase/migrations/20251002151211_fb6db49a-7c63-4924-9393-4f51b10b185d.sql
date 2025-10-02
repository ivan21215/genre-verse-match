-- Create user event preferences table for social matching
CREATE TABLE public.user_event_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  genre TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  event_location TEXT NOT NULL,
  event_date DATE NOT NULL,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_event_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user event preferences
CREATE POLICY "Users can view all preferences for matching" 
ON public.user_event_preferences 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own preferences" 
ON public.user_event_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_event_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" 
ON public.user_event_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_event_preferences_updated_at
BEFORE UPDATE ON public.user_event_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();