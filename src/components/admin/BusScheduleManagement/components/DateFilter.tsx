
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateFilterProps {
  selectedDate?: Date;
  onDateChange: (date: Date | undefined) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  selectedDate,
  onDateChange
}) => {
  return (
    <div className="mb-6">
      <label className="text-sm font-medium mb-2 block">Filter by Date</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-60 justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : "All dates"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
