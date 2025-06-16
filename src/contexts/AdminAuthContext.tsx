
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'branch_admin';
  branchId?: string | null;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  loginAdmin: (email: string, passKey: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  silentRefreshSession: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionRetryCount, setSessionRetryCount] = useState(0);

  const establishAdminSession = async (adminUserId: string, retryCount = 0): Promise<boolean> => {
    try {
      console.log('Establishing admin session for:', adminUserId, 'Retry:', retryCount);
      const { data: sessionData, error: sessionError } = await supabase.rpc('establish_admin_session', {
        admin_user_id: adminUserId
      });
      
      if (sessionError) {
        console.error('Error establishing admin session RPC:', sessionError);
        return false;
      }
      
      console.log('Session establishment result:', sessionData);
      
      const response = sessionData as any;
      if (typeof response === 'object' && response !== null) {
        if (response.success) {
          console.log('Admin session context established successfully.');
          return true;
        } else {
          console.error('Failed to establish admin session:', response.error || 'No details provided by RPC.');
          return false;
        }
      }

      if (response === true) {
        console.log('Admin session established successfully (legacy boolean response).');
        return true;
      }

      console.error('Failed to establish admin session with unexpected response:', response);
      return false;

    } catch (error) {
      console.error('Exception establishing admin session:', error);
      return false;
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    if (!adminUser) return false;
    
    try {
      console.log('Refreshing admin session for:', adminUser.id);
      const sessionEstablished = await establishAdminSession(adminUser.id);
      if (!sessionEstablished) {
        console.error('Failed to refresh admin session');
        // Don't logout immediately on refresh failure, just log the issue
        setSessionRetryCount(prev => prev + 1);
        
        // Only logout after multiple consecutive failures
        if (sessionRetryCount > 3) {
          await logoutAdmin();
          return false;
        }
      } else {
        setSessionRetryCount(0); // Reset retry count on success
      }
      return sessionEstablished;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  };

  // Silent session refresh for API calls
  const silentRefreshSession = async (): Promise<boolean> => {
    if (!adminUser) return false;
    
    try {
      const sessionEstablished = await establishAdminSession(adminUser.id);
      if (sessionEstablished) {
        setSessionRetryCount(0);
      }
      return sessionEstablished;
    } catch (error) {
      console.error('Silent session refresh failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const storedAdmin = localStorage.getItem('adminUser');
        if (storedAdmin) {
          const adminData = JSON.parse(storedAdmin);
          
          console.log('Restoring admin session for:', adminData.email);
          
          // Try to establish admin session for RLS
          const sessionEstablished = await establishAdminSession(adminData.id);
          
          if (sessionEstablished) {
            setAdminUser(adminData);
            console.log('Admin session restored successfully for:', adminData.email);
          } else {
            console.error('Failed to establish admin session on restore');
            localStorage.removeItem('adminUser');
            // Don't show error toast on initial load failure
          }
        }
      } catch (error) {
        console.error('Error checking stored admin session:', error);
        localStorage.removeItem('adminUser');
      }
      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const loginAdmin = async (email: string, passKey: string): Promise<boolean> => {
    setIsLoading(true);
    const lowerCaseEmail = email.toLowerCase();
    
    try {
      console.log('Attempting admin login for:', lowerCaseEmail);
      
      // Get the admin user record to find the user_id
      const { data: adminUserRecord, error: adminUserError } = await supabase
        .from('admin_users')
        .select('user_id, email, role')
        .eq('email', lowerCaseEmail)
        .single();

      if (adminUserError || !adminUserRecord) {
        console.error('Admin user not found:', adminUserError?.message);
        toast.error('Invalid admin credentials - admin not found');
        setIsLoading(false);
        return false;
      }

      console.log('Found admin user with user_id:', adminUserRecord.user_id);

      // Get the auth record using the user_id
      const { data: adminAuth, error: authError } = await supabase
        .from('admin_auth')
        .select('user_id, pass_key_hash')
        .eq('user_id', adminUserRecord.user_id)
        .single();

      if (authError || !adminAuth) {
        console.error('Admin auth record not found:', authError?.message);
        toast.error('Invalid admin credentials - authentication record not found');
        setIsLoading(false);
        return false;
      }

      console.log('Found admin auth record');

      // Use the verify_password function to check the password
      const { data: passwordValid, error: verifyError } = await supabase
        .rpc('verify_password', {
          password: passKey,
          hash: adminAuth.pass_key_hash
        });

      if (verifyError) {
        console.error('Password verification error:', verifyError);
        toast.error('Error verifying credentials');
        setIsLoading(false);
        return false;
      }

      if (!passwordValid) {
        console.error('Password verification failed');
        toast.error('Invalid admin credentials - wrong password');
        setIsLoading(false);
        return false;
      }

      console.log('Password verified successfully');

      // Get branch admin information for role and branch assignment
      const { data: branchAdminData, error: branchAdminError } = await supabase
        .from('branch_admins')
        .select('is_superadmin, branch_id')
        .eq('user_id', adminAuth.user_id)
        .single();

      if (branchAdminError) {
        console.error('Branch admin data not found:', branchAdminError?.message);
        toast.error('Admin role configuration not found');
        setIsLoading(false);
        return false;
      }

      console.log('Found branch admin data:', branchAdminData);

      // Establish session for RLS BEFORE creating admin data
      const sessionEstablished = await establishAdminSession(adminAuth.user_id);

      if (!sessionEstablished) {
        console.error('Failed to establish admin session');
        toast.error('Failed to establish admin session');
        setIsLoading(false);
        return false;
      }

      console.log('Admin session established successfully');

      // Create admin session with proper role information
      const adminData: AdminUser = {
        id: adminAuth.user_id,
        email: lowerCaseEmail,
        role: branchAdminData.is_superadmin ? 'superadmin' : 'branch_admin',
        branchId: branchAdminData.branch_id
      };

      setAdminUser(adminData);
      localStorage.setItem('adminUser', JSON.stringify(adminData));
      setSessionRetryCount(0); // Reset retry count on successful login
      
      // Update last login timestamp
      await supabase
        .from('admin_auth')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', adminAuth.user_id);

      toast.success(`${adminData.role === 'superadmin' ? 'Super Admin' : 'Branch Admin'} logged in successfully`);
      setIsLoading(false);
      return true;

    } catch (error: any) {
      console.error('Admin login process error:', error);
      toast.error(`An error occurred during admin login: ${error.message}`);
      setIsLoading(false);
      return false;
    }
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    if (!adminUser) {
      toast.error('No admin user logged in');
      return false;
    }

    try {
      const { data, error } = await supabase
        .rpc('update_admin_password', {
          admin_user_id: adminUser.id,
          new_password: newPassword
        });

      if (error) {
        console.error('Password change error:', error);
        toast.error('Failed to change password');
        return false;
      }

      if (data) {
        toast.success('Password changed successfully');
        return true;
      } else {
        toast.error('Failed to update password');
        return false;
      }
    } catch (error: any) {
      console.error('Password change process error:', error);
      toast.error(`Error changing password: ${error.message}`);
      return false;
    }
  };

  const logoutAdmin = async (): Promise<void> => {
    setIsLoading(true);
    
    // Sign out from Supabase auth if signed in
    await supabase.auth.signOut();
    
    setAdminUser(null);
    setSessionRetryCount(0);
    localStorage.removeItem('adminUser');
    toast.success('Admin logged out successfully');
    setIsLoading(false);
  };

  const value = {
    adminUser,
    isLoading,
    loginAdmin,
    logoutAdmin,
    changePassword,
    refreshSession,
    silentRefreshSession,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
