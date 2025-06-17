
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, MapPin, User, Clock } from 'lucide-react';
import { PassengerInfo } from './usePassengerManifest';

interface PassengerCardProps {
  passenger: PassengerInfo;
}

const PassengerCard: React.FC<PassengerCardProps> = ({ passenger }) => {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              {passenger.bookings.profiles.full_name
                ?.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase() || 'P'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {passenger.bookings.profiles.full_name || 'Unknown Passenger'}
              </h3>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-500" />
                <span className="font-medium">
                  Seats: {passenger.seat_numbers.join(', ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {passenger.bookings.from_location} → {passenger.bookings.to_location}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{passenger.bookings.departure_time}</span>
              </div>
            </div>

            {passenger.bookings.profiles.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{passenger.bookings.profiles.phone}</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`tel:${passenger.bookings.profiles.phone}`)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`sms:${passenger.bookings.profiles.phone}`)}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    SMS
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassengerCard;
