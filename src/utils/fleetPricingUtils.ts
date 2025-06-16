
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const populateDefaultFleetPricing = async () => {
  try {
    // Get all routes that don't have fleet pricing
    const { data: routes } = await supabase
      .from('routes')
      .select('id, price');

    if (!routes) return;

    // Get all fleet types
    const { data: fleetTypes } = await supabase
      .from('fleet')
      .select('*');

    if (!fleetTypes) return;

    for (const route of routes) {
      // Check if route already has fleet pricing
      const { data: existingPricing } = await supabase
        .from('route_fleet_pricing')
        .select('fleet_id')
        .eq('route_id', route.id);

      const existingFleetIds = existingPricing?.map(p => p.fleet_id) || [];
      
      // Create default pricing for fleet types that don't have custom pricing
      const missingPricing = fleetTypes
        .filter(fleet => !existingFleetIds.includes(fleet.id))
        .map(fleet => ({
          route_id: route.id,
          fleet_id: fleet.id,
          custom_price: route.price * fleet.base_price_multiplier
        }));

      if (missingPricing.length > 0) {
        await supabase
          .from('route_fleet_pricing')
          .insert(missingPricing);
      }
    }

    toast.success('Default fleet pricing populated successfully');
  } catch (error) {
    console.error('Error populating fleet pricing:', error);
    toast.error('Failed to populate default fleet pricing');
  }
};

export const ensureFleetPricingForRoute = async (routeId: string, basePrice: number) => {
  try {
    // Get all fleet types
    const { data: fleetTypes } = await supabase
      .from('fleet')
      .select('*');

    if (!fleetTypes) return;

    // Check existing pricing
    const { data: existingPricing } = await supabase
      .from('route_fleet_pricing')
      .select('fleet_id')
      .eq('route_id', routeId);

    const existingFleetIds = existingPricing?.map(p => p.fleet_id) || [];
    
    // Create default pricing for missing fleet types
    const missingPricing = fleetTypes
      .filter(fleet => !existingFleetIds.includes(fleet.id))
      .map(fleet => ({
        route_id: routeId,
        fleet_id: fleet.id,
        custom_price: basePrice * fleet.base_price_multiplier
      }));

    if (missingPricing.length > 0) {
      await supabase
        .from('route_fleet_pricing')
        .insert(missingPricing);
    }
  } catch (error) {
    console.error('Error ensuring fleet pricing:', error);
  }
};
