
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBookingData = (branchId: string | null) => {
  // Fetch available routes
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['available-routes', branchId],
    queryFn: async () => {
      let query = supabase
        .from('routes')
        .select('*')
        .order('from_location');
      
      if (branchId) {
        query = query.eq('branch_id', branchId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Get available branches for booking
  const { data: branches } = useQuery({
    queryKey: ['branches-for-booking'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_branches_for_booking');
      if (error) throw error;
      return data || [];
    },
  });

  return {
    routes,
    branches,
    routesLoading
  };
};
