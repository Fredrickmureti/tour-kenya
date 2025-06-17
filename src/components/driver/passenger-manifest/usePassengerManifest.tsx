
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDriverAuth } from '@/contexts/DriverAuthContext';

export interface PassengerInfo {
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

export const usePassengerManifest = () => {
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

  return {
    todayManifest,
    isLoading,
    totalPassengers: todayManifest?.length || 0,
    totalSeats: todayManifest?.reduce((total, p) => total + p.seat_numbers.length, 0) || 0
  };
};
