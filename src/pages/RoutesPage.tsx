import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Clock, DollarSign, Star, Search, Users, Calendar, Bus } from 'lucide-react';
import { Link } from 'react-router-dom';

const RoutesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch routes with fleet pricing
  const { data: routesWithPricing, isLoading } = useQuery({
    queryKey: ['routes-with-pricing'],
    queryFn: async () => {
      // First get all routes
      const { data: routes, error: routesError } = await supabase
        .from('routes')
        .select('*')
        .order('is_popular', { ascending: false })
        .order('from_location');

      if (routesError) throw routesError;

      // Then get fleet pricing for each route
      const routesWithFleetPricing = await Promise.all(
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

          // Get all fleet types
          const { data: allFleet } = await supabase
            .from('fleet')
            .select('*')
            .order('base_price_multiplier');

          // Combine custom pricing with default pricing
          const fleetPricing = allFleet?.map(fleet => {
            const customPrice = customPricing?.find(cp => cp.fleet?.id === fleet.id);
            return {
              ...fleet,
              price: customPrice ? customPrice.custom_price : route.price * fleet.base_price_multiplier
            };
          }) || [];

          return {
            ...route,
            fleetPricing
          };
        })
      );

      return routesWithFleetPricing;
    }
  });

  // Filter routes based on search
  const filteredRoutes = routesWithPricing?.filter(route =>
    route.from_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.to_location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Available Routes
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Choose from our comprehensive network of routes with different fleet options
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search routes by location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredRoutes.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredRoutes.map((route: any) => (
                <Card key={route.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <div className="font-bold">{route.from_location}</div>
                          <div className="text-sm text-muted-foreground">to {route.to_location}</div>
                        </div>
                      </CardTitle>
                      {route.is_popular && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{route.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Daily Service</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-3">Departure Times:</p>
                      <div className="flex flex-wrap gap-2">
                        {route.departure_times?.map((time: string) => (
                          <Badge key={time} variant="outline" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Fleet Pricing Options */}
                    {route.fleetPricing && route.fleetPricing.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Bus className="h-4 w-4 text-purple-600" />
                          <p className="text-sm font-medium">Fleet Options & Pricing:</p>
                        </div>
                        <div className="space-y-3">
                          {route.fleetPricing.map((fleet: any) => (
                            <div key={fleet.id} className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-gray-800">{fleet.name}</span>
                                  {fleet.name.toLowerCase().includes('vip') && (
                                    <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">Premium</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {fleet.features?.slice(0, 2).join(', ')}
                                  {fleet.features?.length > 2 && ` +${fleet.features.length - 2} more`}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 text-green-600" />
                                  <span className="font-bold text-green-600 text-sm">
                                    KSh {Number(fleet.price).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  per person
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3">
                        <Link to={`/booking?routeId=${route.id}`}>
                          Book This Route
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-2">No routes found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'Routes will be available soon'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutesPage;
