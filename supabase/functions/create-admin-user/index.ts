
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Create admin user function called');
    
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

    const requestBody = await req.json();
    const { email, password, branchId, isSuperAdmin } = requestBody;
    console.log('Request data:', { email, branchId, isSuperAdmin });

    // Validate required fields
    if (!email || !password) {
      console.error('Missing required fields:', { email: !!email, password: !!password });
      throw new Error('Email and password are required');
    }

    if (!isSuperAdmin && !branchId) {
      console.error('Branch ID required for non-superadmin users');
      throw new Error('Branch ID is required for branch admin users');
    }

    // Check if user already exists in auth.users
    const { data: existingAuthUser, error: authUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUserError) {
      console.error('Error checking existing auth users:', authUserError);
      throw new Error(`Failed to check existing users: ${authUserError.message}`);
    }

    let authUserId;
    let isUpdate = false;
    
    // Check if user already exists
    const existingUser = existingAuthUser.users?.find(user => user.email === email);
    
    if (existingUser) {
      console.log('User already exists in auth.users:', existingUser.id);
      authUserId = existingUser.id;
      isUpdate = true;
      
      // Update the existing user's password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUserId,
        { password }
      );
      
      if (updateError) {
        console.error('Error updating user password:', updateError);
        throw new Error(`Failed to update user password: ${updateError.message}`);
      }
      
      console.log('User password updated successfully');
    } else {
      // Create new user in auth.users
      const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
      });

      if (createUserError) {
        console.error('Error creating auth user:', createUserError);
        throw new Error(`Failed to create auth user: ${createUserError.message}`);
      }

      if (!newUser.user) {
        throw new Error('Failed to create auth user - no user returned');
      }

      authUserId = newUser.user.id;
      console.log('New auth user created:', authUserId);
    }

    // Hash the password using bcrypt for our admin_auth table
    const { data: hashedPassword, error: hashError } = await supabaseAdmin
      .rpc('hash_password', { password });

    if (hashError) {
      console.error('Password hashing error:', hashError);
      throw new Error(`Failed to hash password: ${hashError.message}`);
    }

    if (!hashedPassword) {
      console.error('Password hashing returned null');
      throw new Error('Failed to hash password - no result returned');
    }

    console.log('Password hashed successfully');

    // Upsert admin_users table record
    const { error: adminUserError } = await supabaseAdmin
      .from('admin_users')
      .upsert({
        user_id: authUserId,
        email: email,
        role: isSuperAdmin ? 'superadmin' : 'branch_admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (adminUserError) {
      console.error('Admin user upsert error:', adminUserError);
      throw new Error(`Failed to create/update admin user record: ${adminUserError.message}`);
    }

    console.log('Admin user record created/updated successfully');

    // Upsert admin_auth table record
    const { error: authError } = await supabaseAdmin
      .from('admin_auth')
      .upsert({
        user_id: authUserId,
        pass_key_hash: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (authError) {
      console.error('Admin auth upsert error:', authError);
      throw new Error(`Failed to create/update admin auth record: ${authError.message}`);
    }

    console.log('Admin auth record created/updated successfully');

    // Upsert branch_admins table record
    const { error: branchAdminError } = await supabaseAdmin
      .from('branch_admins')
      .upsert({
        user_id: authUserId,
        admin_email: email,
        branch_id: isSuperAdmin ? null : branchId,
        is_superadmin: isSuperAdmin,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (branchAdminError) {
      console.error('Branch admin upsert error:', branchAdminError);
      throw new Error(`Failed to assign admin to branch: ${branchAdminError.message}`);
    }

    console.log('Branch admin assignment created/updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created/updated successfully',
        adminUserId: authUserId,
        email: email,
        isUpdate: isUpdate
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )

  } catch (error) {
    console.error('Create admin user error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})
