
-- First, let's populate the bus_schedules table with demo data for existing routes
-- This links specific buses to routes and times
INSERT INTO public.bus_schedules (route_id, bus_id, departure_date, departure_time, available_seats, status)
SELECT 
  r.id as route_id,
  f.id as bus_id,
  CURRENT_DATE + interval '1 day' * generate_series(0, 30) as departure_date,
  unnest(r.departure_times) as departure_time,
  f.capacity as available_seats,
  'active' as status
FROM public.routes r
CROSS JOIN public.fleet f
WHERE r.branch_id = f.branch_id OR (r.branch_id IS NULL AND f.branch_id IS NULL)
ON CONFLICT (route_id, bus_id, departure_date, departure_time) DO NOTHING;

-- Update existing seat_availability records to include bus_id
-- This assigns the first available bus for each route/date/time combination
UPDATE public.seat_availability sa
SET bus_id = (
  SELECT bs.bus_id 
  FROM public.bus_schedules bs 
  WHERE bs.route_id = sa.route_id 
    AND bs.departure_date = sa.departure_date 
    AND bs.departure_time = sa.departure_time 
    AND bs.status = 'active'
  LIMIT 1
)
WHERE sa.bus_id IS NULL;

-- Clean up any seat_availability records that couldn't be matched to a bus
DELETE FROM public.seat_availability 
WHERE bus_id IS NULL;

-- Initialize seat availability for routes that don't have any seats yet
INSERT INTO public.seat_availability (route_id, departure_date, departure_time, seat_number, bus_id, status)
SELECT 
  bs.route_id,
  bs.departure_date,
  bs.departure_time,
  generate_series(1, bs.available_seats) as seat_number,
  bs.bus_id,
  'available' as status
FROM public.bus_schedules bs
WHERE NOT EXISTS (
  SELECT 1 FROM public.seat_availability sa 
  WHERE sa.route_id = bs.route_id 
    AND sa.departure_date = bs.departure_date 
    AND sa.departure_time = bs.departure_time
    AND sa.bus_id = bs.bus_id
);
