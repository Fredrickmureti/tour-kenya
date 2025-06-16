
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Star, MapPin, Bus, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FleetPricing {
  id: string;
  name: string;
  price: number;
  features?: string[];
  base_price_multiplier: number;
}

interface RouteItem {
  from: string;
  to: string;
  price: string;
  duration: string;
  id?: string;
  branch_id?: string;
  branch?: {
    id: string;
    name: string;
    code: string;
  };
  fleetPricing?: FleetPricing[];
}

interface PopularRoutesProps {
  routes: RouteItem[];
  isLoading: boolean;
}

const PopularRoutes: React.FC<PopularRoutesProps> = ({ routes, isLoading }) => {
  const createRouteLink = (route: RouteItem) => {
    const params = new URLSearchParams({
      from: route.from,
      to: route.to
    });
    
    if (route.branch_id) {
      params.set('branchId', route.branch_id);
    } else if (route.branch?.id) {
      params.set('branchId', route.branch.id);
    }
    
    if (route.id) {
      params.set('routeId', route.id);
    }
    
    return `/routes?${params.toString()}`;
  };

  const createDirectBookingLink = (route: RouteItem) => {
    if (route.id) {
      const params = new URLSearchParams();
      if (route.branch_id) {
        params.set('branchId', route.branch_id);
      } else if (route.branch?.id) {
        params.set('branchId', route.branch.id);
      }
      return `/booking/${route.id}?${params.toString()}`;
    }
    
    const params = new URLSearchParams();
    params.set('from', route.from);
    params.set('to', route.to);
    if (route.branch_id) {
      params.set('branchId', route.branch_id);
    } else if (route.branch?.id) {
      params.set('branchId', route.branch.id);
    }
    return `/booking?${params.toString()}`;
  };

  const getLowestPrice = (route: RouteItem) => {
    if (route.fleetPricing && route.fleetPricing.length > 0) {
      const minPrice = Math.min(...route.fleetPricing.map(f => f.price));
      return `From KSh ${minPrice.toLocaleString()}`;
    }
    return route.price;
  };

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-yellow-500 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground font-display">
              Popular Routes
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our most traveled routes with convenient schedules and great prices
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading state for routes
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden shadow-lg">
                <CardContent className="p-0">
                  <div className="h-48 flex flex-col">
                    <div className="h-20 bg-gradient-to-r from-muted to-muted/50 animate-pulse"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-muted rounded-full w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded-full w-1/2 animate-pulse"></div>
                      <div className="h-10 bg-muted rounded-lg w-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : routes.length > 0 ? (
            routes.map((route, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-border/50 bg-gradient-to-br from-white to-gray-50 dark:from-card dark:to-card/80">
                <CardContent className="p-0">
                  {/* Header with gradient background */}
                  <div className="relative bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 p-6 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <div className="absolute top-2 right-2 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-2 left-2 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Popular
                        </Badge>
                        <div className="text-lg font-bold">
                          {getLowestPrice(route)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5" />
                          <span className="font-semibold text-lg">{route.from}</span>
                        </div>
                        <ArrowRight className="h-5 w-5 animate-pulse" />
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5" />
                          <span className="font-semibold text-lg">{route.to}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content section */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="font-medium">{route.duration}</span>
                    </div>

                    {/* Fleet Pricing Display */}
                    {route.fleetPricing && route.fleetPricing.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Bus className="h-4 w-4" />
                          <span>Fleet Options:</span>
                        </div>
                        <div className="space-y-2">
                          {route.fleetPricing.slice(0, 3).map((fleet) => (
                            <div key={fleet.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <div>
                                <span className="text-sm font-medium">{fleet.name}</span>
                                {fleet.name.toLowerCase().includes('vip') && (
                                  <Badge variant="outline" className="ml-2 text-xs bg-purple-100 text-purple-800">Premium</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-green-600" />
                                <span className="text-sm font-semibold text-green-600">
                                  KSh {Number(fleet.price).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                          {route.fleetPricing.length > 3 && (
                            <div className="text-center">
                              <Badge variant="outline" className="text-xs">
                                +{route.fleetPricing.length - 3} more options
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Show branch info if available */}
                    {route.branch && (
                      <div className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {route.branch.name}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex flex-col space-y-2">
                      <Link 
                        to={createDirectBookingLink(route)} 
                        className="block w-full"
                      >
                        <Button className="w-full group-hover:bg-brand-600 group-hover:scale-105 transition-all duration-300 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-lg hover:shadow-xl">
                          <span className="mr-2">Book Now</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </Link>
                      
                      <Link 
                        to={createRouteLink(route)} 
                        className="block w-full"
                      >
                        <Button variant="outline" className="w-full border-2 border-brand-500/50 text-brand-600 hover:bg-brand-50 hover:border-brand-500 transition-all duration-300">
                          <span className="mr-2">View Schedule</span>
                          <Clock className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            // No routes found
            <div className="col-span-full">
              <Card className="text-center py-16 border-2 border-dashed border-muted bg-gradient-to-br from-muted/20 to-muted/10">
                <CardContent>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Routes Available</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    No routes are available at the moment. Please check back later for updated schedules.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/routes">
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 hover:border-brand-600 transition-all duration-300 px-8 py-3 text-lg font-semibold hover:scale-105 hover:shadow-lg"
            >
              <span className="mr-2">View All Routes</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;
