
-- Add receipt_status column to receipts table
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS receipt_status text DEFAULT 'pending';

-- Create receipt_verifications table to track verification history
CREATE TABLE IF NOT EXISTS public.receipt_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id uuid NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL,
  verification_type text NOT NULL CHECK (verification_type IN ('verified', 'signed_off', 'cancelled')),
  notes text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on receipt_verifications
ALTER TABLE public.receipt_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage receipt verifications
CREATE POLICY "Admins can manage receipt verifications" ON public.receipt_verifications
  FOR ALL USING (
    is_current_user_superadmin() OR 
    get_current_branch_admin_branch_id() IS NOT NULL
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_receipt_verifications_receipt_id ON public.receipt_verifications(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_verifications_admin_id ON public.receipt_verifications(admin_id);

-- Update verify_receipt function to include verification tracking and sign-off
CREATE OR REPLACE FUNCTION public.verify_receipt(
  p_receipt_id uuid, 
  p_booking_id uuid DEFAULT NULL::uuid, 
  p_admin_user_id uuid DEFAULT NULL::uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
    receipt_exists boolean := false;
    booking_matches boolean := false;
    receipt_info jsonb;
    current_status text;
    verification_count integer := 0;
BEGIN
    -- Check if user is admin
    IF NOT (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Check if receipt exists and get current status
    SELECT EXISTS(SELECT 1 FROM public.receipts WHERE id = p_receipt_id), 
           receipt_status 
    INTO receipt_exists, current_status
    FROM public.receipts 
    WHERE id = p_receipt_id;
    
    IF NOT receipt_exists THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Receipt not found in system');
    END IF;

    -- Check verification history
    SELECT COUNT(*) INTO verification_count
    FROM public.receipt_verifications
    WHERE receipt_id = p_receipt_id AND verification_type = 'signed_off';

    -- If booking_id provided, verify it matches
    IF p_booking_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM public.receipts 
            WHERE id = p_receipt_id AND booking_id = p_booking_id
        ) INTO booking_matches;
        
        IF NOT booking_matches THEN
            RETURN jsonb_build_object(
                'valid', false, 
                'message', 'Receipt ID and Booking ID do not match'
            );
        END IF;
    END IF;

    -- Get detailed receipt information
    SELECT jsonb_build_object(
        'valid', true,
        'message', 'Receipt verified successfully',
        'receipt_id', r.id,
        'receipt_number', r.receipt_number,
        'booking_id', r.booking_id,
        'amount', r.amount,
        'payment_status', r.payment_status,
        'payment_method', r.payment_method,
        'generated_at', r.generated_at,
        'receipt_status', r.receipt_status,
        'passenger_name', COALESCE(p.full_name, mb.passenger_name, 'N/A'),
        'route', CONCAT(b.from_location, ' → ', b.to_location),
        'departure_date', b.departure_date,
        'departure_time', b.departure_time,
        'seat_numbers', b.seat_numbers,
        'verification_count', verification_count,
        'is_signed_off', (verification_count > 0)
    ) INTO receipt_info
    FROM public.receipts r
    JOIN public.bookings b ON r.booking_id = b.id
    LEFT JOIN public.profiles p ON r.user_id = p.id
    LEFT JOIN public.manual_bookings mb ON b.id = mb.booking_id
    WHERE r.id = p_receipt_id;

    -- Record verification attempt if admin_user_id provided
    IF p_admin_user_id IS NOT NULL THEN
        INSERT INTO public.receipt_verifications (
            receipt_id, admin_id, verification_type, notes
        ) VALUES (
            p_receipt_id, p_admin_user_id, 'verified', 'Receipt verification performed'
        );
    END IF;

    RETURN receipt_info;
END;
$function$;

-- Create function to sign off receipts
CREATE OR REPLACE FUNCTION public.sign_off_receipt(
  p_receipt_id uuid,
  p_admin_user_id uuid,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    receipt_exists boolean := false;
    already_signed_off boolean := false;
    receipt_branch_id uuid;
    admin_branch_id uuid;
BEGIN
    -- Check if user is admin
    IF NOT (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Check if receipt exists and get branch
    SELECT EXISTS(SELECT 1 FROM public.receipts r JOIN public.bookings b ON r.booking_id = b.id WHERE r.id = p_receipt_id),
           b.branch_id
    INTO receipt_exists, receipt_branch_id
    FROM public.receipts r
    JOIN public.bookings b ON r.booking_id = b.id
    WHERE r.id = p_receipt_id;
    
    IF NOT receipt_exists THEN
        RETURN jsonb_build_object('success', false, 'message', 'Receipt not found');
    END IF;

    -- Check admin permissions for this branch
    admin_branch_id := get_current_branch_admin_branch_id();
    IF NOT is_current_user_superadmin() AND admin_branch_id != receipt_branch_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Access denied for this branch');
    END IF;

    -- Check if already signed off
    SELECT EXISTS(
        SELECT 1 FROM public.receipt_verifications 
        WHERE receipt_id = p_receipt_id AND verification_type = 'signed_off'
    ) INTO already_signed_off;

    IF already_signed_off THEN
        RETURN jsonb_build_object('success', false, 'message', 'Receipt has already been signed off');
    END IF;

    -- Update receipt status
    UPDATE public.receipts 
    SET receipt_status = 'signed_off'
    WHERE id = p_receipt_id;

    -- Record sign-off
    INSERT INTO public.receipt_verifications (
        receipt_id, admin_id, verification_type, notes
    ) VALUES (
        p_receipt_id, p_admin_user_id, 'signed_off', COALESCE(p_notes, 'Receipt signed off by admin')
    );

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Receipt signed off successfully',
        'receipt_id', p_receipt_id
    );
END;
$function$;

-- Update get_receipt_details function to include branch_id and template info
CREATE OR REPLACE FUNCTION public.get_receipt_details(p_receipt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
    receipt_data JSONB;
    receipt_user_id UUID;
    receipt_branch_id UUID;
    is_admin_access BOOLEAN := false;
BEGIN
    -- Get the receipt's user_id and branch_id first
    SELECT r.user_id, b.branch_id 
    INTO receipt_user_id, receipt_branch_id
    FROM public.receipts r
    JOIN public.bookings b ON r.booking_id = b.id
    WHERE r.id = p_receipt_id;

    IF receipt_user_id IS NULL THEN
        RAISE EXCEPTION 'Receipt not found';
    END IF;

    -- Check if current user is the receipt owner
    IF auth.uid() = receipt_user_id THEN
        is_admin_access := false;
    -- Check if current user is an admin with access to this receipt
    ELSIF is_current_user_superadmin() OR 
          (get_current_branch_admin_branch_id() = receipt_branch_id) THEN
        is_admin_access := true;
    ELSE
        RAISE EXCEPTION 'User not authorized to view this receipt';
    END IF;

    -- Get the receipt data with fleet information and branch context
    SELECT jsonb_build_object(
        'receipt_id', r.id,
        'booking_id', b.id,
        'user_id', r.user_id,
        'user_email', (SELECT email FROM auth.users WHERE id = r.user_id),
        'user_name', COALESCE(p.full_name, mb.passenger_name, 'N/A'),
        'user_phone', COALESCE(p.phone, mb.passenger_phone, 'N/A'),
        'route_name', CONCAT(b.from_location, ' → ', b.to_location),
        'departure_location_name', b.from_location,
        'arrival_location_name', b.to_location,
        'departure_time', CONCAT(b.departure_date::text, ' ', b.departure_time),
        'arrival_time', CONCAT(b.departure_date::text, ' ', b.arrival_time),
        'price', r.amount,
        'payment_method', r.payment_method,
        'payment_status', r.payment_status,
        'receipt_status', r.receipt_status,
        'created_at', r.generated_at,
        'branch_id', b.branch_id,
        'branch_name', COALESCE(br.name, 'Main Branch'),
        'branch_address', COALESCE(br.address, 'Address not available'),
        'branch_phone', br.phone,
        'branch_email', br.email,
        'seat_numbers', b.seat_numbers,
        'receipt_number', r.receipt_number,
        'is_admin_access', is_admin_access,
        -- Fleet information
        'fleet_name', COALESCE(f.name, 'Standard Coach'),
        'fleet_description', COALESCE(f.description, 'Comfortable travel experience'),
        'fleet_features', COALESCE(f.features, ARRAY['Standard seating', 'Air conditioning']::text[]),
        'fleet_capacity', COALESCE(f.capacity, 40),
        'fleet_image_url', f.image_url,
        'bus_id', sa.bus_id
    )
    INTO receipt_data
    FROM public.receipts r
    JOIN public.bookings b ON r.booking_id = b.id
    LEFT JOIN public.profiles p ON r.user_id = p.id
    LEFT JOIN public.manual_bookings mb ON b.id = mb.booking_id
    LEFT JOIN public.branches br ON b.branch_id = br.id
    LEFT JOIN public.seat_availability sa ON (
        sa.route_id::text = b.route_id 
        AND sa.departure_date = b.departure_date 
        AND sa.departure_time = b.departure_time 
        AND sa.seat_number = ANY(
            ARRAY(SELECT unnest(b.seat_numbers)::integer)
        )
        AND sa.booking_id = b.id
    )
    LEFT JOIN public.fleet f ON sa.bus_id = f.id
    WHERE r.id = p_receipt_id
    LIMIT 1;

    RETURN receipt_data;
END;
$function$;
