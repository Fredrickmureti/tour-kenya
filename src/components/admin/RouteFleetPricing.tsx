
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Plus, Trash } from 'lucide-react';

interface RouteFleetPricingProps {
  routeId: string;
  basePrice: number;
}

export const RouteFleetPricing: React.FC<RouteFleetPricingProps> = ({ routeId, basePrice }) => {
  const queryClient = useQueryClient();
  const [pricingData, setPricingData] = useState<Record<string, number>>({});

  // Fetch available fleet types
  const { data: fleetTypes } = useQuery({
    queryKey: ['fleet-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch existing pricing for this route
  const { data: existingPricing } = useQuery({
    queryKey: ['route-fleet-pricing', routeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('route_fleet_pricing')
        .select('*')
        .eq('route_id', routeId);
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || [];
    },
    enabled: !!routeId
  });

  // Update pricing mutation
  const updatePricingMutation = useMutation({
    mutationFn: async (pricing: Array<{fleet_id: string, custom_price: number}>) => {
      // Delete existing pricing
      await supabase
        .from('route_fleet_pricing')
        .delete()
        .eq('route_id', routeId);

      // Insert new pricing
      if (pricing.length > 0) {
        const { error } = await supabase
          .from('route_fleet_pricing')
          .insert(
            pricing.map(p => ({
              route_id: routeId,
              fleet_id: p.fleet_id,
              custom_price: p.custom_price
            }))
          );
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Fleet pricing updated successfully');
      queryClient.invalidateQueries({ queryKey: ['route-fleet-pricing'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update pricing: ${error.message}`);
    }
  });

  React.useEffect(() => {
    if (existingPricing && fleetTypes) {
      const initialPricing: Record<string, number> = {};
      fleetTypes.forEach(fleet => {
        const existing = existingPricing.find(p => p.fleet_id === fleet.id);
        initialPricing[fleet.id] = existing ? existing.custom_price : basePrice * fleet.base_price_multiplier;
      });
      setPricingData(initialPricing);
    }
  }, [existingPricing, fleetTypes, basePrice]);

  const handlePriceChange = (fleetId: string, price: number) => {
    setPricingData(prev => ({
      ...prev,
      [fleetId]: price
    }));
  };

  const handleSave = () => {
    const pricingArray = Object.entries(pricingData).map(([fleetId, price]) => ({
      fleet_id: fleetId,
      custom_price: price
    }));
    
    updatePricingMutation.mutate(pricingArray);
  };

  if (!fleetTypes || fleetTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fleet Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No fleet types available. Please add fleet types first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet Pricing Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Base price: KSh {basePrice.toLocaleString()} - Set custom prices for different fleet types
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {fleetTypes.map(fleet => (
          <div key={fleet.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium">{fleet.name}</h4>
              <p className="text-sm text-muted-foreground">
                Default multiplier: {fleet.base_price_multiplier}x
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor={`price-${fleet.id}`} className="whitespace-nowrap">
                KSh
              </Label>
              <Input
                id={`price-${fleet.id}`}
                type="number"
                value={pricingData[fleet.id] || 0}
                onChange={(e) => handlePriceChange(fleet.id, Number(e.target.value))}
                className="w-32"
                min="0"
                step="50"
              />
            </div>
          </div>
        ))}
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={updatePricingMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{updatePricingMutation.isPending ? 'Saving...' : 'Save Pricing'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteFleetPricing;
