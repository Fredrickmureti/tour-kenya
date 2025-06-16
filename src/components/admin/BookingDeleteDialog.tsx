
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BookingDeleteDialogProps {
  bookingId: string;
  bookingDetails: string;
  onSuccess: () => void;
  children: React.ReactNode;
}

export const BookingDeleteDialog: React.FC<BookingDeleteDialogProps> = ({
  bookingId,
  bookingDetails,
  onSuccess,
  children
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [archiveInstead, setArchiveInstead] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  const handleDelete = async () => {
    if (!confirmationChecked) {
      toast.error('Please confirm that you understand the consequences');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for deletion');
      return;
    }

    setIsDeleting(true);
    try {
      if (archiveInstead) {
        // Archive booking instead of deleting
        const { error } = await supabase
          .from('bookings')
          .update({ 
            status: 'archived',
            admin_notes: `Archived: ${reason}`
          })
          .eq('id', bookingId);

        if (error) throw error;
        toast.success('Booking archived successfully');
      } else {
        // Actually delete the booking
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', bookingId);

        if (error) throw error;
        toast.success('Booking deleted successfully');
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to ${archiveInstead ? 'archive' : 'delete'} booking: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Booking - Danger Zone
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                ⚠️ PERMANENT ACTION WARNING
              </p>
              <p className="text-red-700 text-sm mt-1">
                Deleting a booking is permanent and should only be done if it is no longer needed for reference or reporting. This action cannot be undone.
              </p>
            </div>
            
            <div>
              <p className="font-medium">Booking Details:</p>
              <p className="text-sm text-gray-600">{bookingDetails}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="archive"
              checked={archiveInstead}
              onCheckedChange={(checked) => setArchiveInstead(checked === true)}
            />
            <Label htmlFor="archive" className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-blue-600" />
              Archive instead of delete (recommended)
            </Label>
          </div>
          
          <div>
            <Label htmlFor="reason">Reason for {archiveInstead ? 'archiving' : 'deletion'} *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason..."
              className="mt-1"
              rows={3}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm"
              checked={confirmationChecked}
              onCheckedChange={(checked) => setConfirmationChecked(checked === true)}
            />
            <Label htmlFor="confirm" className="text-sm">
              I understand this action {archiveInstead ? 'will archive' : 'will permanently delete'} the booking and cannot be undone
            </Label>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || !confirmationChecked || !reason.trim()}
            className={archiveInstead ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isDeleting ? 'Processing...' : (archiveInstead ? 'Archive Booking' : 'Delete Permanently')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
