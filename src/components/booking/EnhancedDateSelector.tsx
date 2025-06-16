
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format, isAfter, isSameDay, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface EnhancedDateSelectorProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export const EnhancedDateSelector: React.FC<EnhancedDateSelectorProps> = ({
  selectedDate,
  onDateChange,
  disabled = false
}) => {
  const today = startOfDay(new Date());
  
  // Disable dates that are in the past
  const isDateDisabled = (date: Date) => {
    return !isAfter(date, today) && !isSameDay(date, today);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Travel Date</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : "Select travel date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            disabled={isDateDisabled}
            initialFocus
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
      {selectedDate && isDateDisabled(selectedDate) && (
        <p className="text-sm text-red-600">Please select a future date</p>
      )}
    </div>
  );
};

export default EnhancedDateSelector;
