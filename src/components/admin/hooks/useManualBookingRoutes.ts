
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export interface RouteOption {
  id: string;
  from_location: string;
  to_location: string;
  price: number;
  departure_times: string[];
  duration: string;
}

export const useManualBookingRoutes = () => {
  const { adminUser, refreshSession } = useAdminAuth();

  return useQuery({
    queryKey: ['manual-booking-routes', adminUser?.id],
    queryFn: async (): Promise<RouteOption[]> => {
      console.log('Fetching routes for manual booking...');
      
      if (!adminUser) {
        throw new Error('No admin user found');
      }

      try {
        const { data, error } = await supabase
          .from('routes')
          .select('*')
          .order('from_location', { ascending: true });

        if (error) {
          console.error('Error loading routes:', error);
          
          // Try to refresh session and retry
          if (error.message?.includes('Access denied')) {
            console.log('Attempting to refresh session and retry routes...');
            const sessionRefreshed = await refreshSession();
            if (sessionRefreshed) {
              const { data: retryData, error: retryError } = await supabase
                .from('routes')
                .select('*')
                .order('from_location', { ascending: true });
              
              if (retryError) {
                throw retryError;
              }
              
              console.log('Routes retry successful:', retryData);
              return transformRouteData(retryData || []);
            }
          }
          
          toast.error(`Error loading routes: ${error.message}`);
          throw error;
        }

        console.log('Routes data received:', data);

        if (!data || data.length === 0) {
          console.warn('No routes found in database');
          toast.warning('No routes available. Please add routes first.');
          return [];
        }

        return transformRouteData(data);

      } catch (error: any) {
        console.error('Routes query error:', error);
        toast.error(`Failed to load routes: ${error.message}`);
        throw error;
      }
    },
    enabled: !!adminUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

const transformRouteData = (data: any[]): RouteOption[] => {
  return data.map(route => ({
    id: route.id,
    from_location: route.from_location || '',
    to_location: route.to_location || '',
    price: route.price || 0,
    departure_times: Array.isArray(route.departure_times) ? route.departure_times : [],
    duration: route.duration || 'N/A'
  }));
};

export const useLocationOptions = () => {
  const { data: routes } = useManualBookingRoutes();
  
  const fromLocations = [...new Set(routes?.map(route => route.from_location).filter(Boolean) || [])];
  const toLocations = [...new Set(routes?.map(route => route.to_location).filter(Boolean) || [])];
  
  return {
    fromLocations: fromLocations.sort(),
    toLocations: toLocations.sort(),
    allLocations: [...new Set([...fromLocations, ...toLocations])].sort()
  };
};
