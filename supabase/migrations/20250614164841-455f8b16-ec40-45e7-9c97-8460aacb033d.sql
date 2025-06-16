
-- Step 1: Drop existing function first to avoid return type conflict
DROP FUNCTION IF EXISTS public.get_available_fleet_for_route(uuid, date, text);

-- Step 2: Fix function overloading by dropping the old version and keeping the 5-parameter version
DROP FUNCTION IF EXISTS public.initialize_seat_availability(uuid, date, text, integer);

-- Step 3: Add pricing multiplier to fleet table
ALTER TABLE public.fleet 
ADD COLUMN IF NOT EXISTS base_price_multiplier NUMERIC(3,2) DEFAULT 1.00;

-- Step 4: Update fleet table with pricing multipliers
UPDATE public.fleet 
SET base_price_multiplier = CASE 
  WHEN LOWER(name) LIKE '%standard%' THEN 1.00
  WHEN LOWER(name) LIKE '%premium%' THEN 1.25
  WHEN LOWER(name) LIKE '%luxury%' THEN 1.50
  WHEN LOWER(name) LIKE '%vip%' THEN 2.00
  ELSE 1.00
END;

-- Step 5: Create function to get available fleet with pricing
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
  status TEXT,
  base_price_multiplier NUMERIC,
  route_base_price NUMERIC
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
    bs.status,
    f.base_price_multiplier,
    r.price as route_base_price
  FROM public.bus_schedules bs
  JOIN public.fleet f ON bs.bus_id = f.id
  JOIN public.routes r ON bs.route_id = r.id
  WHERE 
    bs.route_id = p_route_id
    AND bs.departure_date = p_departure_date
    AND bs.departure_time = p_departure_time
    AND bs.status = 'active'
    AND bs.available_seats > 0
  ORDER BY f.base_price_multiplier ASC, f.capacity DESC, f.name;
END;
$$;

-- Step 6: Ensure all seat_availability records have proper bus_id
UPDATE public.seat_availability 
SET bus_id = (
  SELECT bs.bus_id 
  FROM public.bus_schedules bs 
  WHERE bs.route_id = seat_availability.route_id 
    AND bs.departure_date = seat_availability.departure_date 
    AND bs.departure_time = seat_availability.departure_time 
    AND bs.status = 'active'
  LIMIT 1
)
WHERE bus_id IS NULL;

-- Step 7: Clean up orphaned seat availability records
DELETE FROM public.seat_availability 
WHERE bus_id IS NULL;

-- Step 8: Create index for better performance on seat queries
CREATE INDEX IF NOT EXISTS idx_seat_availability_route_date_time_bus 
ON public.seat_availability(route_id, departure_date, departure_time, bus_id);
