
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, MapPin, Calendar, Bus, Armchair, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingStepIndicatorEnhancedProps {
  currentStep: number;
  totalSteps?: number;
}

export const BookingStepIndicatorEnhanced: React.FC<BookingStepIndicatorEnhancedProps> = ({ 
  currentStep, 
  totalSteps = 5 
}) => {
  const steps = [
    { number: 1, title: 'Route', icon: MapPin },
    { number: 2, title: 'Date & Time', icon: Calendar },
    { number: 3, title: 'Bus Type', icon: Bus },
    { number: 4, title: 'Seats', icon: Armchair },
    { number: 5, title: 'Payment', icon: CreditCard }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {steps.slice(0, totalSteps).map((step, index) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            const Icon = step.icon;
            
            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                      isCompleted && 'bg-green-500 border-green-500 text-white',
                      isActive && 'bg-blue-500 border-blue-500 text-white',
                      !isActive && !isCompleted && 'border-gray-300 text-gray-400'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm mt-2 font-medium',
                      isActive && 'text-blue-600',
                      isCompleted && 'text-green-600',
                      !isActive && !isCompleted && 'text-gray-400'
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                
                {index < steps.slice(0, totalSteps).length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-px mx-4 transition-colors',
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingStepIndicatorEnhanced;
