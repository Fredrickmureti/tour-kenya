
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Users } from 'lucide-react';

interface Route {
  id: string;
  from_location: string;
  to_location: string;
  duration: string;
  departure_times: string[];
  price: number;
  branch_id: string;
}

interface RouteSelectionStepProps {
  fromLocation: string;
  toLocation: string;
  onFromLocationChange: (value: string) => void;
  onToLocationChange: (value: string) => void;
  onNextStep: () => void;
  canProceed: boolean;
  routes?: Route[];
  departureLocations: string[];
  arrivalLocations: string[];
}

export const RouteSelectionStep: React.FC<RouteSelectionStepProps> = ({
  fromLocation,
  toLocation,
  onFromLocationChange,
  onToLocationChange,
  onNextStep,
  canProceed,
  routes = [],
  departureLocations,
  arrivalLocations
}) => {
  const availableRoutes = routes.filter(route => {
    if (!fromLocation || !toLocation) return false;
    return route.from_location === fromLocation && route.to_location === toLocation;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Route</CardTitle>
        <CardDescription>Choose your departure and destination</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <Select value={fromLocation} onValueChange={onFromLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select departure city" />
              </SelectTrigger>
              <SelectContent>
                {departureLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <Select value={toLocation} onValueChange={onToLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination city" />
              </SelectTrigger>
              <SelectContent>
                {arrivalLocations.filter(loc => loc !== fromLocation).map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {availableRoutes.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Available Route</h4>
            {availableRoutes.map((route) => (
              <Card key={route.id} className="border-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{route.from_location} → {route.to_location}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {route.duration}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {route.departure_times.length} times available
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        KSh {route.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">per seat</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button 
          onClick={onNextStep} 
          disabled={!canProceed}
          className="w-full"
        >
          Continue to Date & Time
        </Button>
      </CardContent>
    </Card>
  );
};
