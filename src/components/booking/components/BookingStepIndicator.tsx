
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BookingStepIndicatorProps {
  currentStep: number;
}

export const BookingStepIndicator: React.FC<BookingStepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= stepNumber ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {stepNumber}
          </div>
          {stepNumber < 4 && (
            <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
};
