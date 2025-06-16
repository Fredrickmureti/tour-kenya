
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EnhancedSeatSelector from '../EnhancedSeatSelector';
import { format } from 'date-fns';

interface SeatSelectionStepProps {
  routeId: string;
  selectedDate: Date;
  selectedTime: string;
  selectedSeats: number[];
  onSeatsChange: (seats: number[]) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  canProceed: boolean;
}

export const SeatSelectionStep: React.FC<SeatSelectionStepProps> = ({
  routeId,
  selectedDate,
  selectedTime,
  selectedSeats,
  onSeatsChange,
  onNextStep,
  onPrevStep,
  canProceed
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Seats</CardTitle>
        <CardDescription>Choose your preferred seats for the journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <EnhancedSeatSelector
          routeId={routeId}
          departureDate={format(selectedDate, 'yyyy-MM-dd')}
          departureTime={selectedTime}
          onSeatsChange={onSeatsChange}
          selectedSeats={selectedSeats}
        />

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onPrevStep}>
            Back
          </Button>
          <Button 
            onClick={onNextStep} 
            disabled={!canProceed}
            className="flex-1"
          >
            Continue to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
