
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RouteFormValues, RouteWithFleet } from './types';

export const useRoutesData = () => {
  const queryClient = useQueryClient();

  // Fetch available locations for dropdowns
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch available fleet types
  const { data: fleetTypes } = useQuery({
    queryKey: ['fleet-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet')
        .select('*')
        .order('base_price_multiplier');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch routes with fleet pricing
  const { data: routes, isLoading, refetch } = useQuery({
    queryKey: ['admin-routes'],
    queryFn: async () => {
      const { data: routes, error } = await supabase
        .from('routes')
        .select('*')
        .order('from_location', { ascending: true });
        
      if (error) throw error;

      // Get fleet pricing for each route
      const routesWithPricing = await Promise.all(
        routes.map(async (route) => {
          const { data: fleetPricing } = await supabase
            .from('route_fleet_pricing')
            .select(`
              custom_price,
              fleet:fleet_id (
                id,
                name,
                base_price_multiplier,
                features
              )
            `)
            .eq('route_id', route.id);

          // Get all fleet types for default pricing
          const { data: allFleet } = await supabase
            .from('fleet')
            .select('*')
            .order('base_price_multiplier');

          const fleetOptions = allFleet?.map(fleet => {
            const customPrice = fleetPricing?.find(fp => fp.fleet?.id === fleet.id);
            return {
              ...fleet,
              price: customPrice ? customPrice.custom_price : route.price * fleet.base_price_multiplier
            };
          }) || [];

          return {
            ...route,
            fleetOptions
          };
        })
      );

      return routesWithPricing || [];
    },
  });

  // Add route mutation
  const addRouteMutation = useMutation({
    mutationFn: async (values: RouteFormValues) => {
      const departure_times = values.departure_times
        .split(',')
        .map(time => time.trim())
        .filter(time => time);
        
      const { data, error } = await supabase
        .from('routes')
        .insert({
          from_location: values.from_location,
          to_location: values.to_location,
          price: values.base_price,
          duration: values.duration,
          departure_times,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Set up fleet pricing
      if (fleetTypes && fleetTypes.length > 0) {
        const fleetPricingData = fleetTypes.map(fleet => ({
          route_id: data.id,
          fleet_id: fleet.id,
          custom_price: values.fleet_pricing?.[fleet.id] || values.base_price * fleet.base_price_multiplier
        }));

        await supabase
          .from('route_fleet_pricing')
          .insert(fleetPricingData);
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Route added successfully with fleet pricing');
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error adding route: ${error.message}`);
    },
  });

  // Edit route mutation
  const editRouteMutation = useMutation({
    mutationFn: async ({ values, routeId }: { values: RouteFormValues; routeId: string }) => {
      const departure_times = values.departure_times
        .split(',')
        .map(time => time.trim())
        .filter(time => time);
        
      const { error } = await supabase
        .from('routes')
        .update({
          from_location: values.from_location,
          to_location: values.to_location,
          price: values.base_price,
          duration: values.duration,
          departure_times,
        })
        .eq('id', routeId);
        
      if (error) throw error;
      
      // Update fleet pricing
      if (values.fleet_pricing && fleetTypes) {
        // Delete existing pricing
        await supabase
          .from('route_fleet_pricing')
          .delete()
          .eq('route_id', routeId);
        
        // Insert new pricing
        const fleetPricingData = fleetTypes.map(fleet => ({
          route_id: routeId,
          fleet_id: fleet.id,
          custom_price: values.fleet_pricing![fleet.id] || values.base_price * fleet.base_price_multiplier
        }));

        await supabase
          .from('route_fleet_pricing')
          .insert(fleetPricingData);
      }
    },
    onSuccess: () => {
      toast.success('Route updated successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error updating route: ${error.message}`);
    },
  });

  // Delete route mutation
  const deleteRouteMutation = useMutation({
    mutationFn: async (routeId: string) => {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Route deleted successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error deleting route: ${error.message}`);
    },
  });

  return {
    locations,
    fleetTypes,
    routes: routes as RouteWithFleet[],
    isLoading,
    refetch,
    addRoute: addRouteMutation.mutate,
    editRoute: editRouteMutation.mutate,
    deleteRoute: deleteRouteMutation.mutate,
  };
};
