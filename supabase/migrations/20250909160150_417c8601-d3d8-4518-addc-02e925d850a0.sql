-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  interval TEXT DEFAULT 'month', -- month or year
  features JSONB NOT NULL DEFAULT '[]',
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscribers table for venue owners
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create event tickets table
CREATE TABLE public.event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL DEFAULT 'general',
  price INTEGER NOT NULL DEFAULT 0, -- in cents
  quantity_available INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ticket purchases table
CREATE TABLE public.ticket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES event_tickets(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount INTEGER NOT NULL, -- in cents
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, paid, cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create venue analytics table
CREATE TABLE public.venue_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- views, bookings, revenue, etc.
  metric_value INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans (public read)
CREATE POLICY "Everyone can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

-- RLS policies for subscribers
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Insert subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Update subscription" 
ON public.subscribers 
FOR UPDATE 
USING (true);

-- RLS policies for event_tickets
CREATE POLICY "Everyone can view event tickets" 
ON public.event_tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Venue owners can manage their event tickets" 
ON public.event_tickets 
FOR ALL 
USING (event_id IN (
  SELECT events.id FROM events 
  JOIN venues ON events.venue_id = venues.id 
  WHERE venues.owner_id = auth.uid()
));

-- RLS policies for ticket_purchases
CREATE POLICY "Users can view their own purchases" 
ON public.ticket_purchases 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create purchases" 
ON public.ticket_purchases 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update purchases" 
ON public.ticket_purchases 
FOR UPDATE 
USING (true);

-- RLS policies for venue_analytics
CREATE POLICY "Venue owners can view their analytics" 
ON public.venue_analytics 
FOR SELECT 
USING (venue_id IN (
  SELECT venues.id FROM venues WHERE venues.owner_id = auth.uid()
));

CREATE POLICY "Insert analytics" 
ON public.venue_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX idx_subscribers_email ON public.subscribers(email);
CREATE INDEX idx_event_tickets_event_id ON public.event_tickets(event_id);
CREATE INDEX idx_ticket_purchases_user_id ON public.ticket_purchases(user_id);
CREATE INDEX idx_ticket_purchases_event_id ON public.ticket_purchases(event_id);
CREATE INDEX idx_venue_analytics_venue_id ON public.venue_analytics(venue_id);
CREATE INDEX idx_venue_analytics_date ON public.venue_analytics(date);

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_tickets_updated_at
BEFORE UPDATE ON public.event_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_purchases_updated_at
BEFORE UPDATE ON public.ticket_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price, features) VALUES
('Basic', 999, '["Up to 5 events per month", "Basic analytics", "Email support"]'),
('Premium', 2999, '["Unlimited events", "Advanced analytics", "Priority support", "Event promotion tools", "Custom branding"]'),
('Enterprise', 9999, '["Everything in Premium", "API access", "Dedicated account manager", "Custom integrations", "White-label solution"]');