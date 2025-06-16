
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SeatInfo {
  seat_number: number;
  status: string;
  is_available: boolean;
}

interface SeatSelectorProps {
  routeId: string;
  departureDate: string;
  departureTime: string;
  onSeatsChange: (seats: number[]) => void;
  selectedSeats: number[];
  maxSeats?: number;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  routeId,
  departureDate,
  departureTime,
  onSeatsChange,
  selectedSeats,
  maxSeats = 5
}) => {
  const { user } = useAuth();
  const [seats, setSeats] = useState<SeatInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [lockedSeats, setLockedSeats] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (routeId && departureDate && departureTime) {
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
  }, [routeId, departureDate, departureTime]);

  const fetchSeatAvailability = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_seat_availability', {
        p_route_id: routeId,
        p_departure_date: departureDate,
        p_departure_time: departureTime
      });

      if (error) throw error;
      setSeats(data || []);
    } catch (error) {
      console.error('Error fetching seat availability:', error);
      toast.error('Failed to load seat availability');
    } finally {
      setLoading(false);
    }
  };

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

      if (error) throw error;
      
      if (data) {
        setLockedSeats(prev => new Set([...prev, seatNumber]));
        return true;
      } else {
        toast.error('Seat is no longer available');
        return false;
      }
    } catch (error) {
      console.error('Error locking seat:', error);
      toast.error('Failed to reserve seat');
      return false;
    }
  };

  const handleSeatClick = async (seatNumber: number) => {
    const seat = seats.find(s => s.seat_number === seatNumber);
    if (!seat?.is_available) return;

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

  const getSeatStatus = (seat: SeatInfo) => {
    if (selectedSeats.includes(seat.seat_number)) return 'selected';
    if (lockedSeats.has(seat.seat_number)) return 'locked';
    return seat.status;
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800';
      case 'selected':
        return 'bg-blue-500 text-white border-blue-600';
      case 'locked':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'booked':
        return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed';
      case 'maintenance':
        return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Your Seats</h3>
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

      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="text-center mb-4">
          <div className="bg-gray-300 rounded-lg p-2 inline-block">
            <span className="text-sm font-medium">Driver</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          {seats.map((seat) => {
            const status = getSeatStatus(seat);
            const isClickable = seat.is_available;

            return (
              <Button
                key={seat.seat_number}
                variant="outline"
                size="sm"
                onClick={() => isClickable && handleSeatClick(seat.seat_number)}
                disabled={!isClickable}
                className={cn(
                  'h-12 w-12 p-0 text-xs font-medium',
                  getSeatColor(status)
                )}
              >
                {seat.seat_number}
              </Button>
            );
          })}
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
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

export default SeatSelector;
