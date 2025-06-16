
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Users, Bus, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeatData {
  seat_number: number;
  status: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  booking_id: string;
  bus_id: string;
  fleet_name: string;
}

interface Route {
  id: string;
  from_location: string;
  to_location: string;
  departure_times: string[];
}

export const AdminSeatMap: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);

  // Fetch routes
  const { data: routes } = useQuery({
    queryKey: ['admin-routes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('routes').select('*');
      if (error) throw error;
      return data as Route[];
    }
  });

  // Fetch seat map data
  const { data: seatMap, isLoading: seatMapLoading, refetch } = useQuery({
    queryKey: ['admin-seat-map', selectedRoute, selectedDate, selectedTime],
    queryFn: async () => {
      if (!selectedRoute || !selectedDate || !selectedTime) return [];
      
      const { data, error } = await supabase.rpc('get_admin_seat_map', {
        p_route_id: selectedRoute,
        p_departure_date: format(selectedDate, 'yyyy-MM-dd'),
        p_departure_time: selectedTime
      });

      if (error) throw error;
      return data as SeatData[];
    },
    enabled: !!(selectedRoute && selectedDate && selectedTime)
  });

  const selectedRouteData = routes?.find(r => r.id === selectedRoute);

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800';
      case 'booked':
        return 'bg-blue-100 border-blue-300 text-blue-800 cursor-pointer hover:bg-blue-200';
      case 'locked':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-500';
    }
  };

  const handleSeatClick = (seat: SeatData) => {
    if (seat.status === 'booked') {
      setSelectedSeat(seat);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Seat Map Viewer
          </CardTitle>
          <CardDescription>
            View real-time seat assignments and passenger details for any route
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Route Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Route</label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes?.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.from_location} → {route.to_location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Departure Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {selectedRouteData?.departure_times.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button onClick={() => refetch()} className="w-full">
                Refresh
              </Button>
            </div>
          </div>

          {/* Seat Map */}
          {seatMapLoading ? (
            <div className="text-center py-8">Loading seat map...</div>
          ) : seatMap && seatMap.length > 0 ? (
            <div className="space-y-6">
              {/* Legend */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span>Locked</span>
                </div>
              </div>

              {/* Bus Info */}
              {seatMap[0]?.fleet_name && (
                <div className="bg-muted p-3 rounded-lg">
                  <h3 className="font-medium">Bus: {seatMap[0].fleet_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Capacity: {seatMap.length} seats | 
                    Booked: {seatMap.filter(s => s.status === 'booked').length} | 
                    Available: {seatMap.filter(s => s.status === 'available').length}
                  </p>
                </div>
              )}

              {/* Driver Section */}
              <div className="text-center mb-4">
                <div className="bg-gray-300 dark:bg-gray-600 rounded-lg p-3 inline-block">
                  <span className="text-sm font-medium">Driver</span>
                </div>
              </div>

              {/* Seat Grid */}
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                {seatMap.map((seat) => (
                  <Button
                    key={seat.seat_number}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSeatClick(seat)}
                    className={cn(
                      'h-12 w-12 p-0 text-xs font-medium',
                      getSeatColor(seat.status)
                    )}
                  >
                    {seat.seat_number}
                  </Button>
                ))}
              </div>
            </div>
          ) : selectedRoute && selectedDate && selectedTime ? (
            <div className="text-center py-8 text-muted-foreground">
              No seat data available for this selection
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select a route, date, and time to view the seat map
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passenger Details Modal */}
      {selectedSeat && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Passenger Details - Seat {selectedSeat.seat_number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{selectedSeat.passenger_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedSeat.passenger_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedSeat.passenger_email}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Booking ID</label>
                  <p className="font-mono text-sm">{selectedSeat.booking_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant="outline" className="ml-2">
                    {selectedSeat.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedSeat(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSeatMap;
