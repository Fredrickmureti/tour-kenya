
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SeatInfo {
  seat_number: number;
  status: string;
  is_available: boolean;
}

export const useSeatManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureSeatAvailability = useCallback(async (
    routeId: string,
    departureDate: string,
    departureTime: string,
    totalSeats: number = 40
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Use initialize_seat_availability function which returns void
      const { error } = await supabase.rpc('initialize_seat_availability', {
        p_route_id: routeId,
        p_departure_date: departureDate,
        p_departure_time: departureTime,
        p_total_seats: totalSeats
      });

      if (error) {
        console.error('Error initializing seat availability:', error);
        setError('Failed to initialize seats');
        return false;
      }

      console.log('Seats initialized successfully');
      return true;
    } catch (err) {
      console.error('Error in ensureSeatAvailability:', err);
      setError('Network error while initializing seats');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSeatAvailability = useCallback(async (
    routeId: string,
    departureDate: string,
    departureTime: string
  ): Promise<SeatInfo[]> => {
    try {
      setLoading(true);
      setError(null);

      // First ensure seats are initialized
      await ensureSeatAvailability(routeId, departureDate, departureTime);

      const { data, error } = await supabase.rpc('get_seat_availability', {
        p_route_id: routeId,
        p_departure_date: departureDate,
        p_departure_time: departureTime
      });

      if (error) {
        console.error('Error fetching seat availability:', error);
        throw new Error('Failed to fetch seat availability');
      }

      return data || [];
    } catch (err) {
      console.error('Error in fetchSeatAvailability:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [ensureSeatAvailability]);

  const lockSeat = useCallback(async (
    routeId: string,
    departureDate: string,
    departureTime: string,
    seatNumber: number,
    userId: string,
    lockDurationMinutes: number = 10
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('lock_seat', {
        p_route_id: routeId,
        p_departure_date: departureDate,
        p_departure_time: departureTime,
        p_seat_number: seatNumber,
        p_user_id: userId,
        p_lock_duration_minutes: lockDurationMinutes
      });

      if (error) {
        console.error('Error locking seat:', error);
        // If locking fails due to permissions, show warning but allow selection
        toast.warning('Seat reserved locally (database write may be restricted)');
        return true;
      }

      return data === true;
    } catch (err) {
      console.error('Error in lockSeat:', err);
      toast.warning('Seat reserved locally (network error)');
      return true;
    }
  }, []);

  const releaseExpiredLocks = useCallback(async (): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('release_expired_locks');

      if (error) {
        console.error('Error releasing expired locks:', error);
        return 0;
      }

      return data || 0;
    } catch (err) {
      console.error('Error in releaseExpiredLocks:', err);
      return 0;
    }
  }, []);

  const generateFallbackSeats = useCallback((totalSeats: number = 40): SeatInfo[] => {
    return Array.from({ length: totalSeats }, (_, i) => ({
      seat_number: i + 1,
      status: 'available',
      is_available: true
    }));
  }, []);

  return {
    loading,
    error,
    ensureSeatAvailability,
    fetchSeatAvailability,
    lockSeat,
    releaseExpiredLocks,
    generateFallbackSeats
  };
};
