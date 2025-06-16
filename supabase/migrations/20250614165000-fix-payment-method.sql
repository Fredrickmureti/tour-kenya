
-- Update the create_booking_with_branch function to handle payment method correctly
CREATE OR REPLACE FUNCTION public.create_booking_with_branch(
    p_user_id uuid, 
    p_route_id text, 
    p_from_location text, 
    p_to_location text, 
    p_departure_date date, 
    p_departure_time text, 
    p_arrival_time text, 
    p_seat_numbers text[], 
    p_price numeric, 
    p_status text, 
    p_branch_id uuid,
    p_payment_method text DEFAULT 'card'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    new_booking_id UUID;
    new_receipt_id UUID;
    receipt_details JSONB;
BEGIN
    -- Insert into bookings table
    INSERT INTO public.bookings (
        user_id, route_id, from_location, to_location, departure_date, 
        departure_time, arrival_time, seat_numbers, price, status, branch_id
    )
    VALUES (
        p_user_id, p_route_id, p_from_location, p_to_location, p_departure_date, 
        p_departure_time, p_arrival_time, p_seat_numbers, p_price, p_status, p_branch_id
    )
    RETURNING id INTO new_booking_id;

    -- Insert into receipts table with correct payment method
    INSERT INTO public.receipts (
        booking_id, user_id, amount, payment_status, payment_method
    )
    VALUES (
        new_booking_id, p_user_id, p_price, 'Paid', p_payment_method
    )
    RETURNING id INTO new_receipt_id;

    -- Retrieve receipt details to return
    SELECT jsonb_build_object(
        'booking_id', b.id,
        'receipt_id', r.id,
        'receipt_number', r.receipt_number,
        'amount_paid', r.amount,
        'payment_date', r.generated_at,
        'from_location', b.from_location,
        'to_location', b.to_location,
        'departure_date', b.departure_date,
        'departure_time', b.departure_time,
        'seat_numbers', b.seat_numbers,
        'branch_id', b.branch_id
    )
    INTO receipt_details
    FROM public.bookings b
    JOIN public.receipts r ON b.id = r.booking_id
    WHERE b.id = new_booking_id;

    RETURN receipt_details;
END;
$function$;
