
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import PaymentMethodSelector from '../PaymentMethodSelector';
import { BookingSummary } from './BookingSummary';

interface PaymentConfirmationStepProps {
  fromLocation: string;
  toLocation: string;
  selectedDate: Date;
  selectedTime: string;
  selectedSeats: number[];
  totalPrice: number;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onBooking: () => void;
  onPrevStep: () => void;
  isProcessing: boolean;
  fleetName?: string;
}

export const PaymentConfirmationStep: React.FC<PaymentConfirmationStepProps> = ({
  fromLocation,
  toLocation,
  selectedDate,
  selectedTime,
  selectedSeats,
  totalPrice,
  paymentMethod,
  onPaymentMethodChange,
  onBooking,
  onPrevStep,
  isProcessing,
  fleetName
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment & Confirmation</CardTitle>
        <CardDescription>Review your booking and complete payment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <BookingSummary
          fromLocation={fromLocation}
          toLocation={toLocation}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedSeats={selectedSeats}
          totalPrice={totalPrice}
          fleetName={fleetName}
        />

        <PaymentMethodSelector
          selectedMethod={paymentMethod}
          onMethodChange={onPaymentMethodChange}
        />

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onPrevStep}>
            Back
          </Button>
          <Button 
            onClick={onBooking}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Complete Booking
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
