
-- Create bus_schedules table to link specific buses to routes and times
CREATE TABLE public.bus_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL,
  bus_id UUID NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TEXT NOT NULL,
  available_seats INTEGER NOT NULL DEFAULT 40,
  status TEXT NOT NULL DEFAULT 'active', -- active, full, maintenance, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(route_id, bus_id, departure_date, departure_time)
);

-- Add foreign key to fleet table for bus_id
ALTER TABLE public.bus_schedules 
ADD CONSTRAINT fk_bus_schedules_bus_id 
FOREIGN KEY (bus_id) REFERENCES public.fleet(id) ON DELETE CASCADE;

-- Create function to get available fleet types for a route
CREATE OR REPLACE FUNCTION public.get_available_fleet_for_route(
  p_route_id UUID,
  p_departure_date DATE,
  p_departure_time TEXT
)
RETURNS TABLE(
  bus_id UUID,
  fleet_name TEXT,
  fleet_description TEXT,
  capacity INTEGER,
  features TEXT[],
  image_url TEXT,
  available_seats INTEGER,
  status TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bs.bus_id,
    f.name as fleet_name,
    f.description as fleet_description,
    f.capacity,
    f.features,
    f.image_url,
    bs.available_seats,
    bs.status
  FROM public.bus_schedules bs
  JOIN public.fleet f ON bs.bus_id = f.id
  WHERE 
    bs.route_id = p_route_id
    AND bs.departure_date = p_departure_date
    AND bs.departure_time = p_departure_time
    AND bs.status = 'active'
    AND bs.available_seats > 0
  ORDER BY f.capacity DESC, f.name;
END;
$$;

-- Create function to assign bus to booking and update seat availability
CREATE OR REPLACE FUNCTION public.assign_bus_to_booking(
  p_route_id UUID,
  p_departure_date DATE,
  p_departure_time TEXT,
  p_preferred_bus_id UUID DEFAULT NULL,
  p_required_seats INTEGER DEFAULT 1
)
RETURNS TABLE(
  assigned_bus_id UUID,
  fleet_name TEXT,
  available_seats INTEGER,
  is_fallback BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  selected_bus_id UUID;
  selected_fleet_name TEXT;
  selected_available_seats INTEGER;
  is_fallback_assignment BOOLEAN := false;
BEGIN
  -- First try to assign preferred bus if specified
  IF p_preferred_bus_id IS NOT NULL THEN
    SELECT bs.bus_id, f.name, bs.available_seats
    INTO selected_bus_id, selected_fleet_name, selected_available_seats
    FROM public.bus_schedules bs
    JOIN public.fleet f ON bs.bus_id = f.id
    WHERE 
      bs.route_id = p_route_id
      AND bs.departure_date = p_departure_date
      AND bs.departure_time = p_departure_time
      AND bs.bus_id = p_preferred_bus_id
      AND bs.status = 'active'
      AND bs.available_seats >= p_required_seats;
  END IF;
  
  -- If preferred bus not available, find alternative
  IF selected_bus_id IS NULL THEN
    SELECT bs.bus_id, f.name, bs.available_seats
    INTO selected_bus_id, selected_fleet_name, selected_available_seats
    FROM public.bus_schedules bs
    JOIN public.fleet f ON bs.bus_id = f.id
    WHERE 
      bs.route_id = p_route_id
      AND bs.departure_date = p_departure_date
      AND bs.departure_time = p_departure_time
      AND bs.status = 'active'
      AND bs.available_seats >= p_required_seats
    ORDER BY f.capacity DESC, bs.available_seats DESC
    LIMIT 1;
    
    is_fallback_assignment := (p_preferred_bus_id IS NOT NULL);
  END IF;
  
  -- Return the assigned bus details
  RETURN QUERY
  SELECT 
    selected_bus_id,
    selected_fleet_name,
    selected_available_seats,
    is_fallback_assignment;
END;
$$;

-- Update seat_availability table to include bus_id
ALTER TABLE public.seat_availability 
ADD COLUMN bus_id UUID REFERENCES public.fleet(id);

-- Create index for better performance
CREATE INDEX idx_bus_schedules_route_date_time ON public.bus_schedules(route_id, departure_date, departure_time);
CREATE INDEX idx_seat_availability_bus_id ON public.seat_availability(bus_id);

-- Update initialize_seat_availability to work with specific buses
CREATE OR REPLACE FUNCTION public.initialize_seat_availability(
  p_route_id UUID, 
  p_departure_date DATE, 
  p_departure_time TEXT, 
  p_total_seats INTEGER DEFAULT 40,
  p_bus_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_bus_id UUID;
  bus_capacity INTEGER;
BEGIN
  -- If bus_id not provided, get the first available bus for this route/time
  IF p_bus_id IS NULL THEN
    SELECT bs.bus_id, f.capacity
    INTO target_bus_id, bus_capacity
    FROM public.bus_schedules bs
    JOIN public.fleet f ON bs.bus_id = f.id
    WHERE 
      bs.route_id = p_route_id
      AND bs.departure_date = p_departure_date
      AND bs.departure_time = p_departure_time
      AND bs.status = 'active'
    LIMIT 1;
  ELSE
    target_bus_id := p_bus_id;
    SELECT capacity INTO bus_capacity
    FROM public.fleet
    WHERE id = target_bus_id;
  END IF;
  
  -- Use bus capacity if available, otherwise default
  IF bus_capacity IS NOT NULL THEN
    p_total_seats := bus_capacity;
  END IF;
  
  -- Insert seats if they don't exist
  INSERT INTO public.seat_availability (route_id, departure_date, departure_time, seat_number, bus_id)
  SELECT p_route_id, p_departure_date, p_departure_time, generate_series(1, p_total_seats), target_bus_id
  ON CONFLICT (route_id, departure_date, departure_time, seat_number) DO NOTHING;
END;
$$;

-- Update get_seat_availability to work with specific buses
CREATE OR REPLACE FUNCTION public.get_seat_availability(
  p_route_id UUID, 
  p_departure_date DATE, 
  p_departure_time TEXT,
  p_bus_id UUID DEFAULT NULL
)
RETURNS TABLE(seat_number INTEGER, status TEXT, is_available BOOLEAN, bus_id UUID)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.seat_number,
    sa.status,
    (sa.status = 'available') as is_available,
    sa.bus_id
  FROM public.seat_availability sa
  WHERE 
    sa.route_id = p_route_id
    AND sa.departure_date = p_departure_date
    AND sa.departure_time = p_departure_time
    AND (p_bus_id IS NULL OR sa.bus_id = p_bus_id)
  ORDER BY sa.seat_number;
END;
$$;

-- Function for admins to get seat map with passenger details
CREATE OR REPLACE FUNCTION public.get_admin_seat_map(
  p_route_id UUID,
  p_departure_date DATE,
  p_departure_time TEXT,
  p_bus_id UUID DEFAULT NULL
)
RETURNS TABLE(
  seat_number INTEGER,
  status TEXT,
  passenger_name TEXT,
  passenger_phone TEXT,
  passenger_email TEXT,
  booking_id UUID,
  bus_id UUID,
  fleet_name TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Check admin privileges
  IF NOT (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    sa.seat_number,
    sa.status,
    COALESCE(p.full_name, mb.passenger_name, 'N/A') as passenger_name,
    COALESCE(p.phone, mb.passenger_phone, 'N/A') as passenger_phone,
    COALESCE(u.email::text, mb.passenger_email, 'N/A') as passenger_email,
    sa.booking_id,
    sa.bus_id,
    f.name as fleet_name
  FROM public.seat_availability sa
  LEFT JOIN public.bookings b ON sa.booking_id = b.id
  LEFT JOIN public.profiles p ON b.user_id = p.id
  LEFT JOIN auth.users u ON b.user_id = u.id
  LEFT JOIN public.manual_bookings mb ON b.id = mb.booking_id
  LEFT JOIN public.fleet f ON sa.bus_id = f.id
  WHERE 
    sa.route_id = p_route_id
    AND sa.departure_date = p_departure_date
    AND sa.departure_time = p_departure_time
    AND (p_bus_id IS NULL OR sa.bus_id = p_bus_id)
  ORDER BY sa.seat_number;
END;
$$;
