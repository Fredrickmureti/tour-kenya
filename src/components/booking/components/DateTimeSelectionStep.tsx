
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EnhancedDateSelector from '../EnhancedDateSelector';

interface Route {
  id: string;
  from_location: string;
  to_location: string;
  departure_times: string[];
}

interface DateTimeSelectionStepProps {
  selectedRoute: Route;
  selectedDate: Date | undefined;
  selectedTime: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  canProceed: boolean;
  routeIdFromUrl?: string | null;
}

export const DateTimeSelectionStep: React.FC<DateTimeSelectionStepProps> = ({
  selectedRoute,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  onNextStep,
  onPrevStep,
  canProceed,
  routeIdFromUrl
}) => {
  const availableTimes = selectedRoute?.departure_times || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Date & Time</CardTitle>
        <CardDescription>
          Route: {selectedRoute.from_location} → {selectedRoute.to_location}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <EnhancedDateSelector
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />

        {selectedDate && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Departure Time</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => onTimeChange(time)}
                  className="justify-center"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          {!routeIdFromUrl && (
            <Button variant="outline" onClick={onPrevStep}>
              Back
            </Button>
          )}
          <Button 
            onClick={onNextStep} 
            disabled={!canProceed}
            className={routeIdFromUrl ? "w-full" : "flex-1"}
          >
            Continue to Seat Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
