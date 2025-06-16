
-- Create a more reliable database function for admin user creation
CREATE OR REPLACE FUNCTION public.create_admin_user_v2(
  p_email text,
  p_password text,
  p_branch_id uuid DEFAULT NULL,
  p_is_superadmin boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_user_id uuid;
  hashed_password text;
  result jsonb;
  existing_admin_count integer;
BEGIN
  -- Validate input parameters
  IF p_email IS NULL OR p_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email is required');
  END IF;
  
  IF p_password IS NULL OR p_password = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Password is required');
  END IF;
  
  IF NOT p_is_superadmin AND (p_branch_id IS NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Branch ID is required for branch admin users');
  END IF;
  
  -- Check if admin with this email already exists
  SELECT COUNT(*) INTO existing_admin_count
  FROM public.admin_users
  WHERE email = p_email;
  
  -- Generate new UUID for the admin user
  new_user_id := gen_random_uuid();
  
  -- Hash the password
  SELECT public.hash_password(p_password) INTO hashed_password;
  
  IF hashed_password IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Failed to hash password');
  END IF;
  
  BEGIN
    -- Insert/Update admin_users table
    INSERT INTO public.admin_users (
      user_id,
      email,
      role,
      created_at,
      updated_at
    )
    VALUES (
      new_user_id,
      p_email,
      CASE WHEN p_is_superadmin THEN 'superadmin'::admin_role ELSE 'branch_admin'::admin_role END,
      now(),
      now()
    )
    ON CONFLICT (email) DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = now()
    RETURNING user_id INTO new_user_id;
    
    -- Insert/Update admin_auth table
    INSERT INTO public.admin_auth (
      user_id,
      pass_key_hash,
      created_at,
      updated_at
    )
    VALUES (
      new_user_id,
      hashed_password,
      now(),
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      pass_key_hash = EXCLUDED.pass_key_hash,
      updated_at = now();
    
    -- Insert/Update branch_admins table
    INSERT INTO public.branch_admins (
      user_id,
      admin_email,
      branch_id,
      is_superadmin,
      created_at
    )
    VALUES (
      new_user_id,
      p_email,
      CASE WHEN p_is_superadmin THEN NULL ELSE p_branch_id END,
      p_is_superadmin,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      branch_id = EXCLUDED.branch_id,
      is_superadmin = EXCLUDED.is_superadmin,
      admin_email = EXCLUDED.admin_email;
    
    -- Return success result
    result := jsonb_build_object(
      'success', true,
      'message', CASE 
        WHEN existing_admin_count > 0 THEN 'Admin user updated successfully'
        ELSE 'Admin user created successfully'
      END,
      'user_id', new_user_id,
      'email', p_email,
      'is_update', existing_admin_count > 0
    );
    
    RETURN result;
    
  EXCEPTION
    WHEN unique_violation THEN
      RETURN jsonb_build_object('success', false, 'error', 'Admin user with this email already exists');
    WHEN foreign_key_violation THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid branch ID provided');
    WHEN OTHERS THEN
      RETURN jsonb_build_object('success', false, 'error', 'Database error: ' || SQLERRM);
  END;
END;
$function$;
