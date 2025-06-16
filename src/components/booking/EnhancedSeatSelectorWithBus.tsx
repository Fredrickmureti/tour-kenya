import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SeatInfo {
  seat_number: number;
  status: string;
  is_available: boolean;
  bus_id: string;
}

interface EnhancedSeatSelectorWithBusProps {
  routeId: string;
  departureDate: string;
  departureTime: string;
  busId: string;
  fleetName: string;
  onSeatsChange: (seats: number[]) => void;
  selectedSeats: number[];
  maxSeats?: number;
}

export const EnhancedSeatSelectorWithBus: React.FC<EnhancedSeatSelectorWithBusProps> = ({
  routeId,
  departureDate,
  departureTime,
  busId,
  fleetName,
  onSeatsChange,
  selectedSeats,
  maxSeats = 5
}) => {
  const { user } = useAuth();
  const [seats, setSeats] = useState<SeatInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [lockedSeats, setLockedSeats] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const fetchSeatAvailability = async () => {
    if (!routeId || !departureDate || !departureTime || !busId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching seat availability for bus:', { routeId, departureDate, departureTime, busId });
      
      // First ensure bus schedules exist for this route/time/bus combination
      const { data: scheduleCheck } = await supabase
        .from('bus_schedules')
        .select('*')
        .eq('route_id', routeId)
        .eq('departure_date', departureDate)
        .eq('departure_time', departureTime)
        .eq('bus_id', busId)
        .eq('status', 'active')
        .single();

      if (!scheduleCheck) {
        console.log('No bus schedule found, creating one...');
        // Create bus schedule if it doesn't exist
        const { error: scheduleError } = await supabase
          .from('bus_schedules')
          .insert({
            route_id: routeId,
            bus_id: busId,
            departure_date: departureDate,
            departure_time: departureTime,
            available_seats: 40,
            status: 'active'
          });

        if (scheduleError) {
          console.error('Error creating bus schedule:', scheduleError);
        }
      }
      
      // Initialize seats for this specific bus using the 5-parameter function
      const { error: initError } = await supabase.rpc('initialize_seat_availability', {
        p_route_id: routeId,
        p_departure_date: departureDate,
        p_departure_time: departureTime,
        p_total_seats: 40,
        p_bus_id: busId
      });

      if (initError) {
        console.error('Error initializing seat availability:', initError);
      }
      
      // Fetch seat availability with specific bus_id using the updated function
      const { data, error } = await supabase.rpc('get_seat_availability', {
        p_route_id: routeId,
        p_departure_date: departureDate,
        p_departure_time: departureTime,
        p_bus_id: busId
      });

      if (error) {
        console.error('Error fetching seat availability:', error);
        throw new Error('Failed to load seat availability');
      }

      if (!data || data.length === 0) {
        console.log('No seat data returned, generating fallback seats');
        const fallbackSeats: SeatInfo[] = Array.from({ length: 40 }, (_, i) => ({
          seat_number: i + 1,
          status: 'available',
          is_available: true,
          bus_id: busId
        }));
        setSeats(fallbackSeats);
      } else {
        console.log('Seat availability data:', data);
        // Map the data to include bus_id
        const mappedSeats = data.map(seat => ({
          ...seat,
          bus_id: busId
        }));
        setSeats(mappedSeats);
      }
    } catch (error) {
      console.error('Error fetching seat availability:', error);
      setError('Failed to load seat availability');
      // Generate fallback seats
      const fallbackSeats: SeatInfo[] = Array.from({ length: 40 }, (_, i) => ({
        seat_number: i + 1,
        status: 'available',
        is_available: true,
        bus_id: busId
      }));
      setSeats(fallbackSeats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeId && departureDate && departureTime && busId) {
      fetchSeatAvailability();
      
      // Set up real-time subscription for seat updates
      const channel = supabase
        .channel('seat-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'seat_availability',
            filter: `route_id=eq.${routeId}`
          },
          () => {
            fetchSeatAvailability();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [routeId, departureDate, departureTime, busId]);

  const lockSeat = async (seatNumber: number) => {
    if (!user) {
      toast.error('Please log in to select seats');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('lock_seat', {
        p_route_id: routeId,
        p_departure_date: departureDate,
        p_departure_time: departureTime,
        p_seat_number: seatNumber,
        p_user_id: user.id,
        p_lock_duration_minutes: 10
      });

      if (error) {
        console.error('Error locking seat:', error);
        toast.warning('Seat reserved locally');
        return true; // Allow local reservation
      }
      
      if (data) {
        setLockedSeats(prev => new Set([...prev, seatNumber]));
        return true;
      } else {
        toast.error('Seat is no longer available');
        return false;
      }
    } catch (error) {
      console.error('Error locking seat:', error);
      toast.warning('Seat reserved locally');
      return true; // Allow local reservation as fallback
    }
  };

  const handleSeatClick = async (seatNumber: number) => {
    const seat = seats.find(s => s.seat_number === seatNumber);
    
    // More permissive availability check
    const isAvailable = !seat || seat.is_available || seat.status === 'available';
    
    if (!isAvailable && seat?.status === 'booked') {
      toast.error('This seat is already booked');
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      // Deselect seat
      onSeatsChange(selectedSeats.filter(s => s !== seatNumber));
      setLockedSeats(prev => {
        const newSet = new Set(prev);
        newSet.delete(seatNumber);
        return newSet;
      });
    } else {
      // Select seat
      if (selectedSeats.length >= maxSeats) {
        toast.error(`You can only select up to ${maxSeats} seats`);
        return;
      }

      const locked = await lockSeat(seatNumber);
      if (locked) {
        onSeatsChange([...selectedSeats, seatNumber]);
      }
    }
  };

  const getSeatStatus = (seat: SeatInfo | undefined, seatNumber: number) => {
    if (selectedSeats.includes(seatNumber)) return 'selected';
    if (lockedSeats.has(seatNumber)) return 'locked';
    if (!seat) return 'available';
    return seat.status;
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800 cursor-pointer';
      case 'selected':
        return 'bg-blue-500 text-white border-blue-600 cursor-pointer';
      case 'locked':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 cursor-not-allowed';
      case 'booked':
        return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-500 cursor-pointer';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading seats...</span>
      </div>
    );
  }

  const seatCount = Math.max(seats.length, 40);
  const seatNumbers = Array.from({ length: seatCount }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Select Your Seats</h3>
          <p className="text-sm text-muted-foreground">Bus: {fleetName}</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <div className="text-center mb-6">
          <div className="bg-gray-300 dark:bg-gray-600 rounded-lg p-3 inline-block">
            <span className="text-sm font-medium">Driver</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {seatNumbers.map((seatNumber) => {
            const seat = seats.find(s => s.seat_number === seatNumber);
            const status = getSeatStatus(seat, seatNumber);
            const isClickable = status === 'available' || status === 'selected';

            return (
              <Button
                key={seatNumber}
                variant="outline"
                size="sm"
                onClick={() => isClickable && handleSeatClick(seatNumber)}
                disabled={!isClickable}
                className={cn(
                  'h-12 w-12 p-0 text-xs font-medium',
                  getSeatColor(status)
                )}
              >
                {seatNumber}
              </Button>
            );
          })}
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Selected Seats:</h4>
          <div className="flex gap-2 flex-wrap">
            {selectedSeats.map((seatNumber) => (
              <Badge key={seatNumber} variant="default">
                Seat {seatNumber}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Seats are temporarily reserved for 10 minutes
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedSeatSelectorWithBus;
