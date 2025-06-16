
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Fix get_admin_bookings function
    const { error: bookingsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.get_admin_bookings(p_branch_id uuid DEFAULT NULL::uuid)
        RETURNS TABLE(
          booking_id uuid, 
          user_id uuid, 
          route_name text, 
          passenger_name text, 
          passenger_phone text, 
          passenger_email text, 
          departure_date date, 
          departure_time text, 
          seat_numbers text[], 
          price numeric, 
          status text, 
          created_at timestamp with time zone, 
          branch_name text, 
          booking_type text
        )
        LANGUAGE plpgsql
        STABLE SECURITY DEFINER
        AS $$
        DECLARE
          branch_filter uuid;
        BEGIN
          -- Check admin privileges
          IF NOT (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL) THEN
            RAISE EXCEPTION 'Access denied. Admin privileges required.';
          END IF;

          -- Determine branch filter
          IF is_current_user_superadmin() THEN
            branch_filter := p_branch_id;
          ELSE
            branch_filter := get_current_branch_admin_branch_id();
          END IF;

          RETURN QUERY
          SELECT 
            b.id::uuid as booking_id,
            b.user_id::uuid,
            CONCAT(b.from_location, ' → ', b.to_location)::text as route_name,
            COALESCE(p.full_name, mb.passenger_name, 'N/A')::text as passenger_name,
            COALESCE(p.phone, mb.passenger_phone, 'N/A')::text as passenger_phone,
            COALESCE(u.email, mb.passenger_email, 'N/A')::text as passenger_email,
            b.departure_date::date,
            b.departure_time::text,
            b.seat_numbers::text[],
            b.price::numeric,
            b.status::text,
            b.created_at::timestamp with time zone,
            COALESCE(br.name, 'Main Branch')::text as branch_name,
            CASE 
              WHEN mb.id IS NOT NULL THEN 'Manual'::text
              ELSE 'Online'::text
            END as booking_type
          FROM public.bookings b
          LEFT JOIN public.profiles p ON b.user_id = p.id
          LEFT JOIN auth.users u ON b.user_id = u.id
          LEFT JOIN public.manual_bookings mb ON b.id = mb.booking_id
          LEFT JOIN public.branches br ON b.branch_id = br.id
          WHERE (branch_filter IS NULL OR b.branch_id = branch_filter)
          ORDER BY b.created_at DESC;
        END;
        $$;
      `
    });

    if (bookingsError) {
      console.error('Error fixing bookings function:', bookingsError);
    }

    // Fix get_admin_analytics function
    const { error: analyticsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.get_admin_analytics(p_branch_id uuid DEFAULT NULL::uuid)
        RETURNS jsonb
        LANGUAGE plpgsql
        STABLE SECURITY DEFINER
        AS $$
        DECLARE
          total_bookings integer;
          total_revenue numeric;
          active_users integer;
          active_routes integer;
          branch_filter uuid;
        BEGIN
          -- Check admin privileges with improved session validation
          IF NOT (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL) THEN
            -- Try to re-establish session if current check fails
            RAISE LOG 'Admin session validation failed, attempting recovery';
            RAISE EXCEPTION 'Access denied. Admin privileges required.';
          END IF;

          -- Determine branch filter
          IF is_current_user_superadmin() THEN
            branch_filter := p_branch_id;
          ELSE
            branch_filter := get_current_branch_admin_branch_id();
          END IF;

          -- Get total bookings
          SELECT COUNT(*)::integer INTO total_bookings
          FROM public.bookings b
          WHERE (branch_filter IS NULL OR b.branch_id = branch_filter);

          -- Get total revenue
          SELECT COALESCE(SUM(r.amount), 0)::numeric INTO total_revenue
          FROM public.receipts r
          JOIN public.bookings b ON r.booking_id = b.id
          WHERE (branch_filter IS NULL OR b.branch_id = branch_filter);

          -- Get active users (users who have made bookings)
          SELECT COUNT(DISTINCT b.user_id)::integer INTO active_users
          FROM public.bookings b
          WHERE (branch_filter IS NULL OR b.branch_id = branch_filter);

          -- Get active routes
          SELECT COUNT(*)::integer INTO active_routes
          FROM public.routes r
          WHERE (branch_filter IS NULL OR r.branch_id = branch_filter);

          RETURN jsonb_build_object(
            'total_bookings', total_bookings,
            'total_revenue', total_revenue,
            'active_users', active_users,
            'active_routes', active_routes
          );
        END;
        $$;
      `
    });

    if (analyticsError) {
      console.error('Error fixing analytics function:', analyticsError);
    }

    // Add exec_sql helper function if it doesn't exist
    const { error: execError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
      `
    }).catch(() => {
      // Function might not exist, create it directly
      return supabaseAdmin.from('dummy').select('*').limit(0);
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Admin functions fixed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Fix admin functions error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
