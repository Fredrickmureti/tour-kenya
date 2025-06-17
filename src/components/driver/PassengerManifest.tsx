
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDriverAuth } from '@/contexts/DriverAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Phone, Mail, MapPin, Seat, Clock } from 'lucide-react';

interface PassengerInfo {
  id: string;
  seat_numbers: string[];
  bookings: {
    user_id: string;
    from_location: string;
    to_location: string;
    departure_time: string;
    profiles: {
      full_name: string;
      phone: string;
    };
  };
}

const PassengerManifest: React.FC = () => {
  const { driver } = useDriverAuth();

  const { data: todayManifest, isLoading } = useQuery({
    queryKey: ['passenger-manifest', driver?.id],
    queryFn: async () => {
      if (!driver?.id) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get driver's assignments for today
      const { data: assignments } = await supabase
        .from('driver_assignments')
        .select('route_id')
        .eq('driver_id', driver.id)
        .eq('status', 'active');

      if (!assignments?.length) return [];

      // Get bookings for driver's routes today
      const { data: bookings, error } = await supabase
        .from('seat_availability')
        .select(`
          id,
          seat_number,
          bookings!inner (
            user_id,
            from_location,
            to_location,
            departure_time,
            profiles!inner (
              full_name,
              phone
            )
          )
        `)
        .eq('departure_date', today)
        .eq('status', 'booked')
        .in('route_id', assignments.map(a => a.route_id));

      if (error) throw error;

      // Group seats by booking
      const groupedBookings = bookings?.reduce((acc: any, seat: any) => {
        const bookingUserId = seat.bookings.user_id;
        if (!acc[bookingUserId]) {
          acc[bookingUserId] = {
            id: bookingUserId,
            seat_numbers: [],
            bookings: seat.bookings
          };
        }
        acc[bookingUserId].seat_numbers.push(seat.seat_number.toString());
        return acc;
      }, {});

      return Object.values(groupedBookings || {}) as PassengerInfo[];
    },
    enabled: !!driver?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardTitle className="flex items-center text-slate-800">
          <Users className="h-6 w-6 mr-3 text-blue-500" />
          Today's Passenger Manifest
        </CardTitle>
        <CardDescription>
          Passengers scheduled for your routes today
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!todayManifest?.length ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-500 mb-2">No passengers scheduled</p>
            <p className="text-sm text-gray-400">Check with admin for today's assignments</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {todayManifest.length} Passengers
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {todayManifest.reduce((total, p) => total + p.seat_numbers.length, 0)} Seats
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {todayManifest.map((passenger) => (
                <Card key={passenger.id} className="border-l-4 border-l-blue-500">
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
                            <Seat className="h-4 w-4 text-blue-500" />
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
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PassengerManifest;
