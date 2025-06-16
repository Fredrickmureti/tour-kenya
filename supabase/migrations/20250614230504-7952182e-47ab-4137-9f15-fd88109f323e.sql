
-- Create function to get admin receipts with sign-off status
CREATE OR REPLACE FUNCTION public.get_admin_receipts_with_signoff(p_branch_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(
    receipt_id uuid, 
    receipt_number text, 
    booking_id uuid, 
    passenger_name text, 
    passenger_phone text, 
    route_name text, 
    amount numeric, 
    payment_method text, 
    payment_status text, 
    generated_at timestamp with time zone, 
    branch_name text,
    receipt_status text,
    is_signed_off boolean,
    verification_count integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
    -- Check if user is admin
    IF NOT (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        r.id as receipt_id,
        r.receipt_number,
        r.booking_id,
        COALESCE(p.full_name, mb.passenger_name, 'N/A') as passenger_name,
        COALESCE(p.phone, mb.passenger_phone, 'N/A') as passenger_phone,
        CONCAT(b.from_location, ' → ', b.to_location) as route_name,
        r.amount,
        r.payment_method,
        r.payment_status,
        r.generated_at,
        COALESCE(br.name, 'Main Branch') as branch_name,
        COALESCE(r.receipt_status, 'pending') as receipt_status,
        EXISTS(
            SELECT 1 FROM public.receipt_verifications rv 
            WHERE rv.receipt_id = r.id AND rv.verification_type = 'signed_off'
        ) as is_signed_off,
        (
            SELECT COUNT(*)::integer FROM public.receipt_verifications rv 
            WHERE rv.receipt_id = r.id AND rv.verification_type = 'signed_off'
        ) as verification_count
    FROM public.receipts r
    JOIN public.bookings b ON r.booking_id = b.id
    LEFT JOIN public.profiles p ON r.user_id = p.id
    LEFT JOIN public.manual_bookings mb ON b.id = mb.booking_id
    LEFT JOIN public.branches br ON b.branch_id = br.id
    WHERE 
        CASE 
            WHEN is_current_user_superadmin() THEN 
                (p_branch_id IS NULL OR b.branch_id = p_branch_id)
            ELSE 
                b.branch_id = get_current_branch_admin_branch_id()
        END
    ORDER BY r.generated_at DESC;
END;
$function$;
