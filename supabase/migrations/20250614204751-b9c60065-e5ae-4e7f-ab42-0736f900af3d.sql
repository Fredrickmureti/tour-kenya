
-- First, let's update the get_receipt_details function to include fleet information
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

    -- Get the receipt data with fleet information
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
        'created_at', r.generated_at,
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

-- Create receipt templates table for admin customization
CREATE TABLE IF NOT EXISTS public.receipt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES public.branches(id),
    template_name TEXT NOT NULL DEFAULT 'Default Template',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    
    -- Branding settings
    logo_url TEXT,
    company_name TEXT DEFAULT 'RouteAura Bus Services',
    company_tagline TEXT DEFAULT 'Your Trusted Travel Partner',
    
    -- Color scheme
    primary_color TEXT DEFAULT '#2563eb',
    secondary_color TEXT DEFAULT '#16a34a',
    accent_color TEXT DEFAULT '#dc2626',
    background_gradient TEXT DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    
    -- Typography
    header_font TEXT DEFAULT 'Inter',
    body_font TEXT DEFAULT 'Inter',
    
    -- Layout settings
    header_style TEXT DEFAULT 'gradient',
    show_qr_code BOOLEAN DEFAULT true,
    show_fleet_details BOOLEAN DEFAULT true,
    show_weather_info BOOLEAN DEFAULT false,
    
    -- Custom content
    header_message TEXT,
    footer_message TEXT DEFAULT 'Thank you for choosing our services!',
    terms_and_conditions TEXT,
    promotional_message TEXT,
    
    -- Contact information
    support_phone TEXT,
    support_email TEXT,
    website_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID
);

-- Create receipt customization settings table
CREATE TABLE IF NOT EXISTS public.receipt_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES public.branches(id),
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(branch_id, setting_key)
);

-- Insert default template for each branch
INSERT INTO public.receipt_templates (branch_id, template_name, is_default)
SELECT id, 'Default Premium Template', true
FROM public.branches
WHERE NOT EXISTS (
    SELECT 1 FROM public.receipt_templates rt WHERE rt.branch_id = branches.id
);

-- Create function to get receipt template for a branch
CREATE OR REPLACE FUNCTION public.get_receipt_template(p_branch_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
    template_data JSONB;
BEGIN
    -- Get the active template for the branch, or default template
    SELECT row_to_json(rt)::jsonb
    INTO template_data
    FROM public.receipt_templates rt
    WHERE (p_branch_id IS NULL OR rt.branch_id = p_branch_id OR rt.branch_id IS NULL)
      AND rt.is_active = true
      AND (rt.is_default = true OR rt.branch_id = p_branch_id)
    ORDER BY 
        CASE WHEN rt.branch_id = p_branch_id THEN 1 ELSE 2 END,
        rt.is_default DESC,
        rt.created_at DESC
    LIMIT 1;

    -- If no template found, return default settings
    IF template_data IS NULL THEN
        template_data := jsonb_build_object(
            'template_name', 'Default Template',
            'company_name', 'RouteAura Bus Services',
            'company_tagline', 'Your Trusted Travel Partner',
            'primary_color', '#2563eb',
            'secondary_color', '#16a34a',
            'accent_color', '#dc2626',
            'background_gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'header_font', 'Inter',
            'body_font', 'Inter',
            'header_style', 'gradient',
            'show_qr_code', true,
            'show_fleet_details', true,
            'show_weather_info', false,
            'footer_message', 'Thank you for choosing our services!'
        );
    END IF;

    RETURN template_data;
END;
$function$;

-- Add RLS policies for receipt templates
ALTER TABLE public.receipt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view receipt templates" ON public.receipt_templates
FOR SELECT USING (
    is_current_user_superadmin() OR 
    get_current_branch_admin_branch_id() = branch_id
);

CREATE POLICY "Admins can insert receipt templates" ON public.receipt_templates
FOR INSERT WITH CHECK (
    is_current_user_superadmin() OR 
    get_current_branch_admin_branch_id() = branch_id
);

CREATE POLICY "Admins can update receipt templates" ON public.receipt_templates
FOR UPDATE USING (
    is_current_user_superadmin() OR 
    get_current_branch_admin_branch_id() = branch_id
);

CREATE POLICY "Admins can delete receipt templates" ON public.receipt_templates
FOR DELETE USING (
    is_current_user_superadmin() OR 
    get_current_branch_admin_branch_id() = branch_id
);

-- Add RLS policies for receipt settings
ALTER TABLE public.receipt_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage receipt settings" ON public.receipt_settings
FOR ALL USING (
    is_current_user_superadmin() OR 
    get_current_branch_admin_branch_id() = branch_id
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_receipt_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_receipt_templates_timestamp
    BEFORE UPDATE ON public.receipt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_receipt_template_timestamp();

CREATE TRIGGER update_receipt_settings_timestamp
    BEFORE UPDATE ON public.receipt_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_receipt_template_timestamp();
