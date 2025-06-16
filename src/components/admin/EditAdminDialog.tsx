
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface EditAdminDialogProps {
  admin: {
    user_id: string;
    email: string;
    role: string;
    is_superadmin: boolean;
    branch_id?: string;
    branch_name?: string;
    is_active?: boolean;
  };
  branches: Array<{ id: string; name: string; city: string }>;
  isOpen: boolean;
  onClose: () => void;
}

const EditAdminDialog: React.FC<EditAdminDialogProps> = ({
  admin,
  branches,
  isOpen,
  onClose
}) => {
  const [email, setEmail] = useState(admin.email);
  const [isSuperAdmin, setIsSuperAdmin] = useState(admin.is_superadmin);
  const [branchId, setBranchId] = useState(admin.branch_id || '');
  const [isActive, setIsActive] = useState(admin.is_active ?? true);
  const [newPassword, setNewPassword] = useState('');
  
  const queryClient = useQueryClient();

  useEffect(() => {
    setEmail(admin.email);
    setIsSuperAdmin(admin.is_superadmin);
    setBranchId(admin.branch_id || '');
    setIsActive(admin.is_active ?? true);
    setNewPassword('');
  }, [admin]);

  const updateAdminMutation = useMutation({
    mutationFn: async () => {
      // Update admin_users table
      const { error: adminUsersError } = await supabase
        .from('admin_users')
        .update({
          email,
          updated_at: new Date().toISOString(),
          is_active: isActive
        })
        .eq('user_id', admin.user_id);

      if (adminUsersError) throw adminUsersError;

      // Update branch_admins table
      const { error: branchAdminsError } = await supabase
        .from('branch_admins')
        .update({
          admin_email: email,
          is_superadmin: isSuperAdmin,
          branch_id: isSuperAdmin ? null : branchId
        })
        .eq('user_id', admin.user_id);

      if (branchAdminsError) throw branchAdminsError;

      // Update password if provided
      if (newPassword) {
        const { error: passwordError } = await supabase.rpc('update_admin_password', {
          admin_user_id: admin.user_id,
          new_password: newPassword
        });

        if (passwordError) throw passwordError;
      }
    },
    onSuccess: () => {
      toast.success('Admin updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-assignments'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Error updating admin: ${error.message}`);
    },
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }

    if (!isSuperAdmin && !branchId) {
      toast.error('Branch is required for branch admins');
      return;
    }

    updateAdminMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Admin User</DialogTitle>
          <DialogDescription>
            Update the admin user's information and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="newPassword">New Password (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
              <Button type="button" variant="outline" onClick={generatePassword}>
                Generate
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="superadmin"
              checked={isSuperAdmin}
              onCheckedChange={setIsSuperAdmin}
            />
            <Label htmlFor="superadmin">Super Admin</Label>
          </div>

          {!isSuperAdmin && (
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateAdminMutation.isPending}
            >
              {updateAdminMutation.isPending ? 'Updating...' : 'Update Admin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAdminDialog;
