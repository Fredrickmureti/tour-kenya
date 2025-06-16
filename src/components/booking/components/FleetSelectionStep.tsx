
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FleetSelector from '../FleetSelector';

interface FleetSelectionStepProps {
  routeId: string;
  departureDate: Date;
  departureTime: string;
  selectedBusId?: string;
  selectedFleetName?: string;
  onBusSelect: (busId: string, fleetName: string, priceMultiplier: number) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  canProceed: boolean;
}

export const FleetSelectionStep: React.FC<FleetSelectionStepProps> = ({
  routeId,
  departureDate,
  departureTime,
  selectedBusId,
  selectedFleetName,
  onBusSelect,
  onNextStep,
  onPrevStep,
  canProceed
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Choose Your Bus</CardTitle>
        <CardDescription>
          Select the bus type that matches your comfort preferences and budget
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FleetSelector
          routeId={routeId}
          departureDate={departureDate.toISOString().split('T')[0]}
          departureTime={departureTime}
          selectedBusId={selectedBusId}
          onBusSelect={onBusSelect}
          onContinue={onNextStep}
        />

        {selectedFleetName && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Selected:</strong> {selectedFleetName}
            </p>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onPrevStep}>
            Back to Date & Time
          </Button>
          <Button 
            onClick={onNextStep} 
            disabled={!canProceed}
          >
            Continue to Seats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FleetSelectionStep;
