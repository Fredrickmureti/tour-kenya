
-- Fix the get_seat_availability function to be read-only
CREATE OR REPLACE FUNCTION public.get_seat_availability(p_route_id uuid, p_departure_date date, p_departure_time text)
 RETURNS TABLE(seat_number integer, status text, is_available boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  -- Just return seat availability without any updates
  RETURN QUERY
  SELECT 
    sa.seat_number,
    sa.status,
    (sa.status = 'available') as is_available
  FROM public.seat_availability sa
  WHERE 
    sa.route_id = p_route_id
    AND sa.departure_date = p_departure_date
    AND sa.departure_time = p_departure_time
  ORDER BY sa.seat_number;
END;
$function$
