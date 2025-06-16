
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BusAssignment {
  assigned_bus_id: string;
  fleet_name: string;
  available_seats: number;
  is_fallback: boolean;
}

export const useFleetManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignBusToBooking = useCallback(async (
    routeId: string,
    departureDate: string,
    departureTime: string,
    preferredBusId?: string,
    requiredSeats: number = 1
  ): Promise<BusAssignment | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('assign_bus_to_booking', {
        p_route_id: routeId,
        p_departure_date: departureDate,
        p_departure_time: departureTime,
        p_preferred_bus_id: preferredBusId || null,
        p_required_seats: requiredSeats
      });

      if (error) {
        console.error('Error assigning bus:', error);
        setError('Failed to assign bus');
        return null;
      }

      if (!data || data.length === 0) {
        setError('No buses available for this route and time');
        toast.error('No buses available for your selection');
        return null;
      }

      const assignment = data[0] as BusAssignment;

      // Enhanced error handling for null fleet names
      if (!assignment.fleet_name || assignment.fleet_name === 'null') {
        console.error('Fleet name is null or invalid:', assignment);
        toast.error('Bus assignment failed. Please try again.');
        return null;
      }

      // Initialize seat availability if needed
      await supabase.rpc('initialize_seat_availability', {
        p_route_id: routeId,
        p_departure_date: departureDate,
        p_departure_time: departureTime,
        p_bus_id: assignment.assigned_bus_id
      });

      // Show appropriate messages based on assignment type
      if (assignment.is_fallback && preferredBusId) {
        toast.warning(
          `Your preferred bus was full. We've assigned you to ${assignment.fleet_name} instead.`,
          { duration: 5000 }
        );
      } else if (preferredBusId) {
        toast.success(`Successfully assigned to ${assignment.fleet_name}`);
      }

      return assignment;
    } catch (err) {
      console.error('Error in assignBusToBooking:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to assign bus');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailableFleet = useCallback(async (
    routeId: string,
    departureDate: string,
    departureTime: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_available_fleet_for_route', {
        p_route_id: routeId,
        p_departure_date: departureDate,
        p_departure_time: departureTime
      });

      if (error) {
        console.error('Error fetching available fleet:', error);
        setError('Failed to fetch available buses');
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in getAvailableFleet:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    assignBusToBooking,
    getAvailableFleet
  };
};
