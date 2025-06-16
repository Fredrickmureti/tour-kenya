
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Clock, Users, Bus } from 'lucide-react';
import { format } from 'date-fns';

interface BookingSummaryProps {
  fromLocation: string;
  toLocation: string;
  selectedDate: Date;
  selectedTime: string;
  selectedSeats: number[];
  totalPrice: number;
  fleetName?: string;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  fromLocation,
  toLocation,
  selectedDate,
  selectedTime,
  selectedSeats,
  totalPrice,
  fleetName
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Booking Summary
        </CardTitle>
        <CardDescription>Please review your booking details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MapPin className="h-4 w-4" />
              Route
            </div>
            <p className="font-medium">{fromLocation} → {toLocation}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              Date
            </div>
            <p className="font-medium">{format(selectedDate, 'EEEE, MMMM do, yyyy')}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              Departure Time
            </div>
            <p className="font-medium">{selectedTime}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              Seats
            </div>
            <p className="font-medium">{selectedSeats.join(', ')}</p>
          </div>

          {fleetName && (
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Bus className="h-4 w-4" />
                Bus Type
              </div>
              <p className="font-medium">{fleetName}</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total Amount:</span>
          <span className="text-2xl font-bold text-green-600">
            KSh {totalPrice.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
