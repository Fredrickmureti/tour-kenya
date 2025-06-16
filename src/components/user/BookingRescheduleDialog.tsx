
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RotateCcw } from 'lucide-react';
import { RescheduleRequestForm } from '@/components/booking/RescheduleRequestForm';

interface Booking {
  id: string;
  route_id: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  departure_time: string;
  seat_numbers: string[];
}

interface BookingRescheduleDialogProps {
  booking: Booking;
  onRescheduleSuccess: () => void;
}

export const BookingRescheduleDialog: React.FC<BookingRescheduleDialogProps> = ({
  booking,
  onRescheduleSuccess
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onRescheduleSuccess();
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
          <DialogDescription>
            Submit a request to reschedule your booking. Our admin team will review and process your request.
          </DialogDescription>
        </DialogHeader>
        
        <RescheduleRequestForm
          booking={booking}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BookingRescheduleDialog;
