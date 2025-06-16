
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Bus, Users, Star, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FleetSelectorProps {
  routeId: string;
  departureDate: string;
  departureTime: string;
  selectedBusId?: string;
  onBusSelect: (busId: string, fleetName: string, priceMultiplier: number) => void;
  onContinue: () => void;
}

const FleetSelector: React.FC<FleetSelectorProps> = ({
  routeId,
  departureDate,
  departureTime,
  selectedBusId,
  onBusSelect,
  onContinue
}) => {
  const [selectedFleet, setSelectedFleet] = useState<string | null>(selectedBusId || null);

  // Fetch available fleet for the route with proper bus schedule initialization
  const { data: availableFleet, isLoading, error, refetch } = useQuery({
    queryKey: ['available-fleet', routeId, departureDate, departureTime],
    queryFn: async () => {
      console.log('Fetching fleet for:', { routeId, departureDate, departureTime });
      
      // First, ensure bus schedules exist for this route/date/time
      const { data: existingSchedules } = await supabase
        .from('bus_schedules')
        .select('*')
        .eq('route_id', routeId)
        .eq('departure_date', departureDate)
        .eq('departure_time', departureTime);

      console.log('Existing schedules:', existingSchedules);

      // If no schedules exist, create them
      if (!existingSchedules || existingSchedules.length === 0) {
        console.log('No schedules found, creating them...');
        
        // Get all fleet types
        const { data: allFleet } = await supabase
          .from('fleet')
          .select('*')
          .order('base_price_multiplier');

        if (allFleet && allFleet.length > 0) {
          // Create bus schedules for each fleet type
          const schedulesToCreate = allFleet.map(fleet => ({
            route_id: routeId,
            bus_id: fleet.id,
            departure_date: departureDate,
            departure_time: departureTime,
            available_seats: fleet.capacity || 40,
            status: 'active'
          }));

          const { error: insertError } = await supabase
            .from('bus_schedules')
            .insert(schedulesToCreate);

          if (insertError) {
            console.error('Error creating bus schedules:', insertError);
            throw insertError;
          }

          console.log('Created bus schedules:', schedulesToCreate);
        }
      }

      // Now fetch available fleet
      const { data: fleetData, error: fleetError } = await supabase.rpc(
        'get_available_fleet_for_route',
        {
          p_route_id: routeId,
          p_departure_date: departureDate,
          p_departure_time: departureTime
        }
      );

      if (fleetError) {
        console.error('Error fetching fleet:', fleetError);
        throw fleetError;
      }

      console.log('Available fleet data:', fleetData);

      // Get custom pricing for this route
      const { data: customPricing } = await supabase
        .from('route_fleet_pricing')
        .select(`
          custom_price,
          fleet_id
        `)
        .eq('route_id', routeId);

      console.log('Custom pricing:', customPricing);

      // Combine fleet data with custom pricing
      const fleetWithPricing = fleetData?.map((fleet: any) => {
        const customPrice = customPricing?.find(cp => cp.fleet_id === fleet.bus_id);
        return {
          ...fleet,
          final_price: customPrice ? customPrice.custom_price : fleet.route_base_price * fleet.base_price_multiplier
        };
      }) || [];

      console.log('Fleet with pricing:', fleetWithPricing);
      return fleetWithPricing;
    },
    retry: 1,
    retryDelay: 1000
  });

  // Initialize seat availability when fleet data is loaded
  useEffect(() => {
    const initializeSeatAvailability = async () => {
      if (availableFleet && availableFleet.length > 0) {
        for (const fleet of availableFleet) {
          try {
            await supabase.rpc('initialize_seat_availability', {
              p_route_id: routeId,
              p_departure_date: departureDate,
              p_departure_time: departureTime,
              p_total_seats: fleet.capacity,
              p_bus_id: fleet.bus_id
            });
          } catch (error) {
            console.error('Error initializing seat availability:', error);
          }
        }
      }
    };

    initializeSeatAvailability();
  }, [availableFleet, routeId, departureDate, departureTime]);

  const handleFleetSelect = (fleet: any) => {
    setSelectedFleet(fleet.bus_id);
    onBusSelect(fleet.bus_id, fleet.fleet_name, fleet.base_price_multiplier);
    toast.success(`Selected ${fleet.fleet_name}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span>Loading available buses...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Fleet selector error:', error);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading available buses. Please try again.
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!availableFleet || availableFleet.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No buses are currently scheduled for this route and time. We're setting up the schedule now.
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="ml-2"
          >
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {availableFleet.map((fleet: any) => (
          <Card 
            key={fleet.bus_id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedFleet === fleet.bus_id 
                ? 'ring-2 ring-primary border-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleFleetSelect(fleet)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-primary" />
                  {fleet.fleet_name}
                  {fleet.fleet_name?.toLowerCase().includes('vip') && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    KSh {Number(fleet.final_price).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">per seat</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription>
                {fleet.fleet_description}
              </CardDescription>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    {fleet.available_seats} seats available
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {fleet.capacity} total capacity
                </Badge>
              </div>

              {fleet.features && fleet.features.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {fleet.features.slice(0, 4).map((feature: string) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {fleet.features.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{fleet.features.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {selectedFleet === fleet.bus_id && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    ✓ Selected - Click "Continue to Seats" to proceed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedFleet && (
        <div className="flex justify-center pt-4">
          <Button onClick={onContinue} size="lg" className="px-8">
            Continue to Seat Selection
          </Button>
        </div>
      )}
    </div>
  );
};

export default FleetSelector;
