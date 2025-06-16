
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Calendar, User, MapPin, CreditCard } from 'lucide-react';
import { ReceiptSignOffDialog } from './ReceiptSignOffDialog';

export interface ReceiptVerification {
  valid: boolean;
  message: string;
  receipt_id?: string;
  receipt_number?: string;
  booking_id?: string;
  amount?: number;
  payment_status?: string;
  payment_method?: string;
  generated_at?: string;
  receipt_status?: string;
  passenger_name?: string;
  route?: string;
  departure_date?: string;
  departure_time?: string;
  seat_numbers?: string[];
  verification_count?: number;
  is_signed_off?: boolean;
}

interface ReceiptVerificationResultProps {
  verification: ReceiptVerification;
  onSignOffSuccess?: () => void;
}

export const ReceiptVerificationResult: React.FC<ReceiptVerificationResultProps> = ({ 
  verification, 
  onSignOffSuccess 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'signed_off':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="mt-4 p-4 border rounded-lg">
      <div className="flex items-center mb-3">
        {verification.valid ? (
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600 mr-2" />
        )}
        <span className={`font-medium ${verification.valid ? 'text-green-800' : 'text-red-800'}`}>
          {verification.message}
        </span>
      </div>

      {verification.valid && verification.receipt_id && (
        <div className="space-y-4">
          {/* Receipt Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge className={getStatusColor(verification.receipt_status || 'pending')}>
                {verification.receipt_status?.charAt(0).toUpperCase() + verification.receipt_status?.slice(1) || 'Pending'}
              </Badge>
            </div>
            {verification.is_signed_off && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Signed Off ({verification.verification_count} times)
              </div>
            )}
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-medium w-20">Receipt:</span>
                <span className="font-mono text-xs">{verification.receipt_number}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1 text-gray-400" />
                <span className="font-medium w-19">Passenger:</span>
                <span>{verification.passenger_name}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                <span className="font-medium w-19">Route:</span>
                <span>{verification.route}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                <span className="font-medium w-20">Date:</span>
                <span>{verification.departure_date && formatDate(verification.departure_date)}</span>
              </div>
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                <span className="font-medium w-19">Amount:</span>
                <span className="font-bold text-green-600">
                  KSh {verification.amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-20">Seats:</span>
                <span>{verification.seat_numbers?.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Sign-off Section */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Generated: {verification.generated_at && formatDateTime(verification.generated_at)}
              </div>
              {onSignOffSuccess && (
                <ReceiptSignOffDialog
                  receiptId={verification.receipt_id}
                  receiptNumber={verification.receipt_number || ''}
                  isAlreadySignedOff={verification.is_signed_off || false}
                  onSignOffSuccess={onSignOffSuccess}
                />
              )}
            </div>
          </div>

          {/* Warning for already signed off receipts */}
          {verification.is_signed_off && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Receipt Already Signed Off</p>
                  <p>This receipt has been verified and signed off by an admin. It cannot be used again.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
