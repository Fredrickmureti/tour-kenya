
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { CheckCircle } from 'lucide-react';
import { ReceiptVerificationForm } from './ReceiptVerificationForm';
import { ReceiptVerificationResult } from './ReceiptVerificationResult';
import { 
  ReceiptVerification, 
  isValidUUID, 
  parseVerificationResponse 
} from './verificationUtils';

export const ReceiptVerificationDialog: React.FC = () => {
  const [receiptId, setReceiptId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [verification, setVerification] = useState<ReceiptVerification | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { adminUser } = useAdminAuth();

  const verifyReceipt = async () => {
    if (!receiptId.trim()) {
      toast.error('Please enter a receipt ID');
      return;
    }

    if (!adminUser) {
      toast.error('Admin user not found. Please log in again.');
      return;
    }

    if (!isValidUUID(receiptId.trim())) {
      toast.error('Please enter a valid receipt ID format');
      setVerification({
        valid: false,
        message: 'Invalid receipt ID format. Please check and try again.'
      });
      return;
    }

    if (bookingId.trim() && !isValidUUID(bookingId.trim())) {
      toast.error('Please enter a valid booking ID format');
      setVerification({
        valid: false,
        message: 'Invalid booking ID format. Please check and try again.'
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Use the enhanced verify_receipt function with all three parameters
      const { data, error } = await supabase.rpc('verify_receipt', {
        p_receipt_id: receiptId.trim(),
        p_booking_id: bookingId.trim() || null,
        p_admin_user_id: adminUser.id
      });

      if (error) {
        console.error('Verification error:', error);
        throw new Error(error.message || 'Verification failed');
      }

      const verificationData = parseVerificationResponse(data);
      setVerification(verificationData);
      
      if (verificationData.valid) {
        toast.success('Receipt verified successfully');
      } else {
        toast.error(verificationData.message || 'Receipt verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying receipt:', error);
      const errorMessage = error.message || 'Verification failed';
      toast.error(`Verification failed: ${errorMessage}`);
      setVerification({ 
        valid: false, 
        message: `Verification error: ${errorMessage}` 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetForm = () => {
    setReceiptId('');
    setBookingId('');
    setVerification(null);
  };

  const handleSignOffSuccess = () => {
    // Re-verify the receipt to get updated status
    verifyReceipt();
  };

  // Show error if no admin user is found
  if (!adminUser) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            Verify Receipt
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Access Required</DialogTitle>
            <DialogDescription>
              Please log in as an admin to verify receipts
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CheckCircle className="h-4 w-4 mr-2" />
          Verify Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Verify Receipt Authenticity</DialogTitle>
          <DialogDescription>
            Enter receipt details to verify authenticity and prevent fraud
          </DialogDescription>
        </DialogHeader>
        
        <ReceiptVerificationForm
          receiptId={receiptId}
          bookingId={bookingId}
          isVerifying={isVerifying}
          onReceiptIdChange={setReceiptId}
          onBookingIdChange={setBookingId}
          onVerify={verifyReceipt}
        />

        {verification && (
          <ReceiptVerificationResult 
            verification={verification} 
            onSignOffSuccess={handleSignOffSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptVerificationDialog;
