
-- Drop the old validation function as it's no longer needed
DROP FUNCTION IF EXISTS public.validate_admin_session();

-- Re-create establish_admin_session to be more robust and provide validation in one step
CREATE OR REPLACE FUNCTION public.establish_admin_session(admin_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  admin_exists boolean;
  is_super_admin_status boolean;
  admin_branch_id uuid;
  session_success boolean := false;
BEGIN
  -- Attempt to set the configuration for the current transaction/session.
  PERFORM set_config('app.current_admin_id', admin_user_id::text, false);
  
  -- Verify the admin user exists
  SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE user_id = admin_user_id) INTO admin_exists;
  
  IF admin_exists THEN
    -- Verify the config was set for the current transaction, this is a proxy for session establishment.
    IF current_setting('app.current_admin_id', true) = admin_user_id::text THEN
        session_success := true;
    END IF;
  END IF;
  
  IF NOT session_success THEN
    -- Clear the setting if user doesn't exist or config failed to set
    PERFORM set_config('app.current_admin_id', '', false);
    RETURN jsonb_build_object(
        'success', false, 
        'error', 'Failed to establish admin session context.'
    );
  END IF;

  -- If session context is set, gather user details
  SELECT is_superadmin, branch_id 
  INTO is_super_admin_status, admin_branch_id
  FROM public.branch_admins
  WHERE user_id = admin_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'admin_id', admin_user_id,
    'is_superadmin', COALESCE(is_super_admin_status, false),
    'branch_id', admin_branch_id
  );
END;
$function$
