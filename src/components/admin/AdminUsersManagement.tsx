
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UserPlusIcon } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { CreateAdminForm } from './CreateAdminForm';
import { AdminUsersTable } from './AdminUsersTable';
import EditAdminDialog from './EditAdminDialog';

interface AdminUserWithAuth {
  user_id: string;
  email: string;
  created_at: string;
  is_superadmin?: boolean;
  updated_at?: string;
  branch_id?: string | null;
  branch_name?: string | null;
  is_active?: boolean;
}

interface Branch {
  id: string;
  name: string;
}

const AdminUsersManagement = () => {
  const [isCreateAdminDialogOpen, setIsCreateAdminDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUserWithAuth | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { adminUser } = useAdminAuth(); 
  const queryClient = useQueryClient();
  
  const { data: currentAdminDetails, isLoading: isLoadingCurrentAdmin } = useQuery({
    queryKey: ['current-admin-details', adminUser?.id], 
    queryFn: async () => {
      if (!adminUser?.id) return null; 
      const { data, error } = await supabase
        .from('branch_admins')
        .select('is_superadmin, branch_id')
        .eq('user_id', adminUser.id) 
        .single();
      
      if (error) {
        console.error("Error fetching admin details:", error);
        return null;
      }
      return data;
    },
    enabled: !!adminUser?.id,
  });

  const isCreatorSuperAdmin = currentAdminDetails?.is_superadmin || false;
  
  const { data: adminUsers, isLoading: isLoadingAdminUsers, refetch } = useQuery({
    queryKey: ['admin-users-with-assignments'],
    queryFn: async () => {
      const { data: adminUserRecords, error: adminUsersError } = await supabase
        .from('admin_users')
        .select(`
          user_id,
          email,
          created_at
        `)
        .order('created_at', { ascending: false });
        
      if (adminUsersError) {
        toast.error(`Error loading admin users: ${adminUsersError.message}`);
        throw adminUsersError;
      }

      const adminUsersWithDetails: AdminUserWithAuth[] = [];
      
      for (const userRecord of adminUserRecords || []) {
        const { data: assignment, error: assignmentError } = await supabase
          .from('branch_admins')
          .select('is_superadmin, branch_id, branches(name)')
          .eq('user_id', userRecord.user_id) 
          .single();

        if (assignmentError && assignmentError.code !== 'PGRST116') { 
          console.warn('Error fetching assignment for', userRecord.email, ':', assignmentError.message);
        }
        
        const { data: authRecord } = await supabase
          .from('admin_auth')
          .select('updated_at')
          .eq('user_id', userRecord.user_id)
          .single();
        
        adminUsersWithDetails.push({
          user_id: userRecord.user_id,
          email: userRecord.email,
          created_at: userRecord.created_at,
          updated_at: authRecord?.updated_at,
          is_superadmin: assignment?.is_superadmin || false,
          branch_id: assignment?.branch_id,
          branch_name: assignment?.branches?.name,
          is_active: true, // Default to active since column doesn't exist yet
        });
      }
      return adminUsersWithDetails;
    },
    enabled: !isLoadingCurrentAdmin 
  });

  const { data: branches } = useQuery<Branch[]>({
    queryKey: ['all-branches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('id, name, city').eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminUserIdToDelete: string) => { 
      const { error: branchError } = await supabase
        .from('branch_admins')
        .delete()
        .eq('user_id', adminUserIdToDelete); 
      if (branchError) throw new Error(`Branch assignment deletion failed: ${branchError.message}`);

      const { error: authError } = await supabase
        .from('admin_auth')
        .delete()
        .eq('user_id', adminUserIdToDelete); 
      if (authError) throw new Error(`Admin auth deletion failed: ${authError.message}`);

      const { error: userError } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', adminUserIdToDelete); 
      if (userError) throw new Error(`Admin user deletion failed: ${userError.message}`);
    },
    onSuccess: () => {
      toast.success('Admin user and assignments deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-assignments'] });
    },
    onError: (error: any) => {
      toast.error(`Error deleting admin: ${error.message}`);
    }
  });
  
  useEffect(() => {
    const changes = supabase
      .channel('admin-schema-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_users' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'branch_admins' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_auth' }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(changes);
    };
  }, [refetch]);

  const handleEditAdmin = (admin: AdminUserWithAuth) => {
    setSelectedAdmin(admin);
    setIsEditDialogOpen(true);
  };

  const handleDeleteAdmin = (adminId: string, email: string) => {
    if (confirm(`Are you sure you want to delete admin ${email} and all their assignments? This action is irreversible.`)) {
      deleteAdminMutation.mutate(adminId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Users Management</h2>
        {isCreatorSuperAdmin && (
          <Dialog open={isCreateAdminDialogOpen} onOpenChange={setIsCreateAdminDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Create Admin User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Admin User</DialogTitle>
              </DialogHeader>
              <CreateAdminForm 
                onSuccess={() => {
                  setIsCreateAdminDialogOpen(false);
                  refetch();
                }}
                isSuperAdminCreator={isCreatorSuperAdmin}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {isLoadingCurrentAdmin || isLoadingAdminUsers ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : adminUsers?.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">No admin users found</p>
        </div>
      ) : (
        <AdminUsersTable
          adminUsers={adminUsers || []}
          isCreatorSuperAdmin={isCreatorSuperAdmin}
          currentAdminId={adminUser?.id}
          onEdit={handleEditAdmin}
          onDelete={handleDeleteAdmin}
          isDeleting={deleteAdminMutation.isPending}
        />
      )}

      {selectedAdmin && branches && (
        <EditAdminDialog
          admin={{
            user_id: selectedAdmin.user_id,
            email: selectedAdmin.email,
            role: selectedAdmin.is_superadmin ? 'superadmin' : 'branch_admin',
            is_superadmin: selectedAdmin.is_superadmin || false,
            branch_id: selectedAdmin.branch_id || '',
            branch_name: selectedAdmin.branch_name || '',
            is_active: selectedAdmin.is_active ?? true
          }}
          branches={branches.map(b => ({ id: b.id, name: b.name, city: b.name }))}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedAdmin(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminUsersManagement;
