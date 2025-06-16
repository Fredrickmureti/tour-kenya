
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReceiptVerificationFormProps {
  receiptId: string;
  bookingId: string;
  isVerifying: boolean;
  onReceiptIdChange: (value: string) => void;
  onBookingIdChange: (value: string) => void;
  onVerify: () => void;
}

export const ReceiptVerificationForm: React.FC<ReceiptVerificationFormProps> = ({
  receiptId,
  bookingId,
  isVerifying,
  onReceiptIdChange,
  onBookingIdChange,
  onVerify
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="receiptId">Receipt ID *</Label>
        <Input
          id="receiptId"
          value={receiptId}
          onChange={(e) => onReceiptIdChange(e.target.value)}
          placeholder="e.g., 12345678-1234-5678-9012-123456789012"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter the full receipt ID from the receipt document
        </p>
      </div>
      
      <div>
        <Label htmlFor="bookingId">Booking ID (Optional)</Label>
        <Input
          id="bookingId"
          value={bookingId}
          onChange={(e) => onBookingIdChange(e.target.value)}
          placeholder="Enter booking ID for cross-verification"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Optional: for additional verification
        </p>
      </div>

      <Button 
        onClick={onVerify} 
        disabled={isVerifying || !receiptId.trim()}
        className="w-full"
      >
        {isVerifying ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Verifying...
          </>
        ) : (
          'Verify Receipt'
        )}
      </Button>
    </div>
  );
};
