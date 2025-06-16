
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';
import { CheckCircle, XCircle, Search, User, MapPin, Calendar, CreditCard, Clock, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnhancedReceiptVerification {
  valid: boolean;
  message: string;
  receipt_id?: string;
  receipt_number?: string;
  booking_id?: string;
  amount?: number;
  payment_status?: string;
  payment_method?: string;
  generated_at?: string;
  passenger_name?: string;
  passenger_phone?: string;
  passenger_email?: string;
  route?: string;
  departure_location?: string;
  arrival_location?: string;
  departure_date?: string;
  departure_time?: string;
  seat_numbers?: string[];
  branch_name?: string;
  booking_date?: string;
}

export const EnhancedReceiptVerification: React.FC = () => {
  const [receiptId, setReceiptId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [verification, setVerification] = useState<EnhancedReceiptVerification | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const isValidUUID = (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  };

  const verifyReceipt = async () => {
    if (!receiptId.trim()) {
      toast.error('Please enter a receipt ID');
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
      // First verify the receipt
      const { data: verifyData, error: verifyError } = await supabase.rpc('verify_receipt', {
        p_receipt_id: receiptId.trim(),
        p_booking_id: bookingId.trim() || null
      });

      if (verifyError) {
        throw new Error(verifyError.message || 'Verification failed');
      }

      let verificationData: EnhancedReceiptVerification;
      
      if (typeof verifyData === 'string') {
        try {
          verificationData = JSON.parse(verifyData);
        } catch {
          verificationData = { valid: false, message: 'Invalid response format' };
        }
      } else if (typeof verifyData === 'object' && verifyData !== null && !Array.isArray(verifyData)) {
        verificationData = verifyData as unknown as EnhancedReceiptVerification;
      } else {
        verificationData = { valid: false, message: 'Receipt not found' };
      }

      // If receipt is valid, get detailed information
      if (verificationData.valid) {
        try {
          const { data: detailsData, error: detailsError } = await supabase.rpc('get_receipt_details', {
            p_receipt_id: receiptId.trim()
          });

          if (!detailsError && detailsData) {
            const details = detailsData as any;
            
            // Enhance verification data with detailed information
            verificationData = {
              ...verificationData,
              passenger_name: details.user_name,
              passenger_phone: details.user_phone,
              passenger_email: details.user_email,
              route: `${details.departure_location_name} → ${details.arrival_location_name}`,
              departure_location: details.departure_location_name,
              arrival_location: details.arrival_location_name,
              departure_date: details.departure_time ? new Date(details.departure_time).toLocaleDateString() : undefined,
              departure_time: details.departure_time ? new Date(details.departure_time).toLocaleTimeString() : undefined,
              seat_numbers: details.seat_numbers,
              branch_name: details.branch_name,
              booking_date: details.created_at ? new Date(details.created_at).toLocaleDateString() : undefined,
              payment_method: details.payment_method,
              amount: details.price
            };
          }
        } catch (detailsError) {
          console.warn('Could not fetch detailed receipt information:', detailsError);
        }
      }

      setVerification(verificationData);
      
      if (verificationData.valid) {
        toast.success('Receipt verified successfully - All details loaded');
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

  return (
    <Dialog onOpenChange={(open) => !open && resetForm()}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Verify Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enhanced Receipt Verification</DialogTitle>
          <DialogDescription>
            Enter receipt details to verify authenticity and view comprehensive booking information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="receiptId">Receipt ID *</Label>
            <Input
              id="receiptId"
              value={receiptId}
              onChange={(e) => setReceiptId(e.target.value)}
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
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter booking ID for cross-verification"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional: for additional verification
            </p>
          </div>

          <Button 
            onClick={verifyReceipt} 
            disabled={isVerifying || !receiptId.trim()}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Verify & Get Details
              </>
            )}
          </Button>

          {verification && (
            <div className={`rounded-lg border-2 ${
              verification.valid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {/* Verification Status Header */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  {verification.valid ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <h3 className={`font-bold text-lg ${
                      verification.valid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {verification.valid ? 'Receipt Verified ✓' : 'Verification Failed ✗'}
                    </h3>
                    <p className={`text-sm ${
                      verification.valid ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {verification.message}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Detailed Information (only for valid receipts) */}
              {verification.valid && (
                <div className="p-4 space-y-4">
                  {/* Receipt & Booking Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 flex items-center mb-2">
                        <Hash className="h-4 w-4 mr-2 text-blue-600" />
                        Receipt Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        {verification.receipt_number && (
                          <p><strong>Receipt #:</strong> {verification.receipt_number}</p>
                        )}
                        {verification.booking_id && (
                          <p><strong>Booking ID:</strong> 
                            <span className="font-mono text-xs ml-1">{verification.booking_id}</span>
                          </p>
                        )}
                        {verification.generated_at && (
                          <p><strong>Generated:</strong> {new Date(verification.generated_at).toLocaleString()}</p>
                        )}
                        {verification.booking_date && (
                          <p><strong>Booked:</strong> {verification.booking_date}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 flex items-center mb-2">
                        <CreditCard className="h-4 w-4 mr-2 text-green-600" />
                        Payment Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        {verification.amount && (
                          <p><strong>Amount:</strong> 
                            <span className="font-bold text-green-600 ml-1">
                              KES {verification.amount.toLocaleString()}
                            </span>
                          </p>
                        )}
                        {verification.payment_method && (
                          <p><strong>Method:</strong> {verification.payment_method}</p>
                        )}
                        {verification.payment_status && (
                          <p><strong>Status:</strong>
                            <Badge 
                              variant={verification.payment_status === 'Paid' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {verification.payment_status}
                            </Badge>
                          </p>
                        )}
                        {verification.branch_name && (
                          <p><strong>Branch:</strong> {verification.branch_name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Passenger Information */}
                  {verification.passenger_name && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 flex items-center mb-2">
                        <User className="h-4 w-4 mr-2 text-purple-600" />
                        Passenger Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p><strong>Name:</strong></p>
                          <p className="text-gray-900">{verification.passenger_name}</p>
                        </div>
                        {verification.passenger_phone && (
                          <div>
                            <p><strong>Phone:</strong></p>
                            <p className="text-gray-900">{verification.passenger_phone}</p>
                          </div>
                        )}
                        {verification.passenger_email && (
                          <div>
                            <p><strong>Email:</strong></p>
                            <p className="text-gray-900 text-xs">{verification.passenger_email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Travel Information */}
                  {verification.route && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 flex items-center mb-2">
                        <MapPin className="h-4 w-4 mr-2 text-orange-600" />
                        Travel Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p><strong>Route:</strong></p>
                          <p className="text-gray-900 font-medium">{verification.route}</p>
                        </div>
                        <div>
                          <p><strong>Travel Date & Time:</strong></p>
                          <div className="flex items-center text-gray-900">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{verification.departure_date}</span>
                            {verification.departure_time && (
                              <>
                                <Clock className="h-3 w-3 ml-2 mr-1" />
                                <span>{verification.departure_time}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {verification.seat_numbers && verification.seat_numbers.length > 0 && (
                          <div className="md:col-span-2">
                            <p><strong>Seat Numbers:</strong></p>
                            <p className="text-gray-900 font-medium">
                              {verification.seat_numbers.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedReceiptVerification;
