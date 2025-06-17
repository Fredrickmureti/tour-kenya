
import React from 'react';
import { Bus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem } from '@/components/ui/form';

interface FleetPricingInputsProps {
  form: any;
  fleetTypes?: Array<{
    id: string;
    name: string;
    base_price_multiplier: number;
    features: string[];
  }>;
}

export const FleetPricingInputs: React.FC<FleetPricingInputsProps> = ({ form, fleetTypes }) => {
  const basePrice = form.watch('base_price') || 0;
  
  if (!fleetTypes?.length) return null;

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Bus className="h-4 w-4 text-purple-600" />
          Fleet Type Pricing
        </h4>
        <p className="text-xs text-muted-foreground mb-4">
          Set specific prices for each fleet type. Leave empty to use calculated price based on base price × multiplier.
        </p>
        {fleetTypes.map((fleet) => {
          const calculatedPrice = basePrice * fleet.base_price_multiplier;
          return (
            <div key={fleet.id} className="grid grid-cols-2 gap-4 items-center mb-3 p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">{fleet.name}</div>
                <div className="text-xs text-muted-foreground">
                  Features: {fleet.features?.slice(0, 2).join(', ')}
                  {fleet.features?.length > 2 && ` +${fleet.features.length - 2} more`}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Auto-calculated: KSh {calculatedPrice.toLocaleString()}
                </div>
              </div>
              <FormField
                control={form.control}
                name={`fleet_pricing.${fleet.id}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={calculatedPrice.toString()}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
