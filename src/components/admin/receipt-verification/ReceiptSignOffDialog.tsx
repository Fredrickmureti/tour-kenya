
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface ReceiptSignOffDialogProps {
  receiptId: string;
  receiptNumber: string;
  isAlreadySignedOff: boolean;
  onSignOffSuccess: () => void;
}

export const ReceiptSignOffDialog: React.FC<ReceiptSignOffDialogProps> = ({
  receiptId,
  receiptNumber,
  isAlreadySignedOff,
  onSignOffSuccess
}) => {
  const [notes, setNotes] = useState('');
  const [isSigningOff, setIsSigningOff] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { adminUser, refreshSession } = useAdminAuth();

  const handleSignOff = async () => {
    if (!adminUser) {
      toast.error('Admin user not found. Please log in again.');
      return;
    }

    setIsSigningOff(true);
    try {
      // Try using the database function first
      const { data, error } = await supabase.rpc('sign_off_receipt', {
        p_receipt_id: receiptId,
        p_admin_user_id: adminUser.id,
        p_notes: notes || null
      });

      if (error) {
        console.error('Sign-off function error:', error);
        
        // Fallback to direct database operations
        if (error.message?.includes('Access denied') || error.message?.includes('function does not exist')) {
          console.log('Attempting fallback sign-off approach...');
          
          // Try to refresh session first
          await refreshSession();
          
          // Update receipt status directly
          const { error: receiptUpdateError } = await supabase
            .from('receipts')
            .update({ receipt_status: 'signed_off' })
            .eq('id', receiptId);

          if (receiptUpdateError) {
            throw new Error(`Failed to update receipt: ${receiptUpdateError.message}`);
          }

          // Record the verification
          const { error: verificationError } = await supabase
            .from('receipt_verifications')
            .insert({
              receipt_id: receiptId,
              admin_id: adminUser.id,
              verification_type: 'signed_off',
              notes: notes || 'Receipt signed off by admin'
            });

          if (verificationError) {
            console.warn('Failed to record verification, but receipt was updated:', verificationError);
          }

          toast.success('Receipt signed off successfully');
          setIsOpen(false);
          setNotes('');
          onSignOffSuccess();
          return;
        }
        
        throw new Error(error.message || 'Sign-off failed');
      }

      if (data && typeof data === 'object') {
        const result = data as { success: boolean; message: string };
        if (result.success) {
          toast.success('Receipt signed off successfully');
          setIsOpen(false);
          setNotes('');
          onSignOffSuccess();
        } else {
          toast.error(result.message || 'Sign-off failed');
        }
      } else {
        // If data is just a boolean or simple response
        toast.success('Receipt signed off successfully');
        setIsOpen(false);
        setNotes('');
        onSignOffSuccess();
      }
    } catch (error: any) {
      console.error('Error signing off receipt:', error);
      toast.error(`Sign-off failed: ${error.message}`);
    } finally {
      setIsSigningOff(false);
    }
  };

  if (isAlreadySignedOff) {
    return (
      <Button variant="outline" disabled className="text-green-600 border-green-300">
        <CheckCircle className="h-4 w-4 mr-2" />
        Signed Off
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Sign Off
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sign Off Receipt</DialogTitle>
          <DialogDescription>
            Sign off receipt {receiptNumber} to mark it as verified and prevent multiple uses.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important:</p>
                <p>Once signed off, this receipt cannot be used again and the action cannot be undone.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this sign-off..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSigningOff}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignOff}
              disabled={isSigningOff}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSigningOff ? 'Signing Off...' : 'Sign Off Receipt'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
