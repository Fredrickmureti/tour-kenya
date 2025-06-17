
-- Create favorite_routes table
CREATE TABLE public.favorite_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for favorite_routes
ALTER TABLE public.favorite_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorite routes" 
  ON public.favorite_routes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite routes" 
  ON public.favorite_routes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite routes" 
  ON public.favorite_routes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create travel_preferences table
CREATE TABLE public.travel_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_seat_type TEXT NOT NULL DEFAULT 'window',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  preferred_departure_time TEXT NOT NULL DEFAULT 'morning',
  accessibility_needs TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for travel_preferences
ALTER TABLE public.travel_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own travel preferences" 
  ON public.travel_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own travel preferences" 
  ON public.travel_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel preferences" 
  ON public.travel_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add unique constraints to prevent duplicate preferences per user
ALTER TABLE public.favorite_routes ADD CONSTRAINT unique_user_route_favorite UNIQUE (user_id, route_id);
ALTER TABLE public.travel_preferences ADD CONSTRAINT unique_user_preferences UNIQUE (user_id);

-- Add update timestamp trigger for travel_preferences
CREATE OR REPLACE FUNCTION update_travel_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_travel_preferences_timestamp
  BEFORE UPDATE ON public.travel_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_preferences_timestamp();
