
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const handleDelete = async () => {
    try {
      // First delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Note: In a real application, you might need to use Supabase Admin API
      // to delete the auth user as well. For now, we'll just delete the profile.
      
      toast.success('User profile deleted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(`Error deleting user: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete this user?
          </p>
          {user && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium text-foreground">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">
                Bookings: {user.booking_count || 0}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            This will delete the user's profile. This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
