
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Key, Copy, Clock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import bcrypt from 'bcryptjs';

interface Driver {
  id: string;
  full_name: string;
  email: string;
  status: string;
  driver_assignments?: {
    fleet?: { name: string } | null;
    routes?: { from_location: string; to_location: string } | null;
  }[];
}

interface DriverActionsMenuProps {
  driver: Driver;
  onStatusUpdate: () => void;
}

export const DriverActionsMenu: React.FC<DriverActionsMenuProps> = ({
  driver,
  onStatusUpdate
}) => {
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const copyLoginCredentials = () => {
    const credentials = `Driver Login Information
Name: ${driver.full_name}
Email: ${driver.email}
Login URL: ${window.location.origin}/driver-login-page
Status: ${driver.status}`;

    navigator.clipboard.writeText(credentials);
    toast.success('Login information copied to clipboard');
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsResetting(true);
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const { error } = await supabase
        .from('driver_auth')
        .update({ pass_key: hashedPassword })
        .eq('driver_id', driver.id);

      if (error) throw error;

      toast.success('Password reset successfully');
      setIsResetPasswordOpen(false);
      setNewPassword('');
    } catch (error: any) {
      toast.error(`Failed to reset password: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const updateDriverStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ status: newStatus })
        .eq('id', driver.id);
        
      if (error) throw error;
      
      toast.success(`Driver status updated to ${newStatus}`);
      onStatusUpdate();
    } catch (error: any) {
      toast.error(`Error updating driver status: ${error.message}`);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={copyLoginCredentials}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Login Info
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setIsResetPasswordOpen(true)}>
            <Key className="h-4 w-4 mr-2" />
            Reset Password
          </DropdownMenuItem>

          {driver.status === 'active' ? (
            <DropdownMenuItem 
              onClick={() => updateDriverStatus('inactive')}
              className="text-red-600"
            >
              <Shield className="h-4 w-4 mr-2" />
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => updateDriverStatus('active')}
              className="text-green-600"
            >
              <Shield className="h-4 w-4 mr-2" />
              Activate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password for {driver.full_name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsResetPasswordOpen(false)}
                disabled={isResetting}
              >
                Cancel
              </Button>
              <Button 
                onClick={resetPassword}
                disabled={isResetting || !newPassword}
              >
                {isResetting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DriverActionsMenu;
