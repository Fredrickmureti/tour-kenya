
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useHomeData = () => {
  // Fetch popular routes with fleet pricing
  const { data: popularRoutes = [], isLoading: routesLoading } = useQuery({
    queryKey: ['popular-routes'],
    queryFn: async () => {
      // Get popular routes
      const { data: routes, error: routesError } = await supabase
        .from('routes')
        .select('*')
        .eq('is_popular', true)
        .order('from_location')
        .limit(6);

      if (routesError) throw routesError;

      // Get fleet pricing for each route
      const routesWithPricing = await Promise.all(
        routes.map(async (route) => {
          // Get custom pricing for this route
          const { data: customPricing } = await supabase
            .from('route_fleet_pricing')
            .select(`
              custom_price,
              fleet:fleet_id (
                id,
                name,
                description,
                features,
                base_price_multiplier
              )
            `)
            .eq('route_id', route.id);

          // Get all fleet types for fallback
          const { data: allFleet } = await supabase
            .from('fleet')
            .select('*')
            .order('base_price_multiplier');

          // Combine custom pricing with default pricing
          const fleetPricing = allFleet?.map(fleet => {
            const customPrice = customPricing?.find(cp => cp.fleet?.id === fleet.id);
            return {
              id: fleet.id,
              name: fleet.name,
              price: customPrice ? customPrice.custom_price : route.price * fleet.base_price_multiplier,
              features: fleet.features,
              base_price_multiplier: fleet.base_price_multiplier
            };
          }) || [];

          return {
            id: route.id,
            from: route.from_location,
            to: route.to_location,
            price: `KSh ${Number(route.price).toLocaleString()}`,
            duration: route.duration,
            fleetPricing
          };
        })
      );

      return routesWithPricing;
    }
  });

  // Fetch testimonials with proper join
  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          user_id
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Get profile data separately to avoid join issues
      const reviewsWithProfiles = await Promise.all(
        data.map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', review.user_id)
            .single();

          return {
            id: review.id,
            name: profile?.full_name || 'Anonymous',
            rating: review.rating,
            text: review.review_text,
            date: new Date(review.created_at).toLocaleDateString()
          };
        })
      );

      return reviewsWithProfiles;
    }
  });

  // Fetch fleet images - return just the image URLs as strings
  const { data: fleetImages = [], isLoading: fleetImagesLoading } = useQuery({
    queryKey: ['fleet-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet')
        .select('image_url')
        .order('base_price_multiplier')
        .limit(3);

      if (error) throw error;
      
      // Extract just the image URLs as strings
      return data?.map(item => item.image_url) || [];
    }
  });

  // Fetch locations
  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  return {
    popularRoutes,
    testimonials,
    fleetImages,
    locations,
    isLoading: routesLoading || testimonialsLoading || fleetImagesLoading || locationsLoading
  };
};
