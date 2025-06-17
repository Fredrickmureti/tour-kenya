
import React from 'react';
import { MapPin, Clock, Bus, Star, Pencil, DollarSign, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PopularRoutesToggle } from '../RoutesManagement/PopularRoutesToggle';
import { RouteWithFleet } from './types';

interface RouteCardProps {
  route: RouteWithFleet;
  onEdit: (route: RouteWithFleet) => void;
  onPricing: (route: RouteWithFleet) => void;
  onDelete: (route: RouteWithFleet) => void;
  onPopularToggle: (routeId: string, isPopular: boolean) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  onEdit,
  onPricing,
  onDelete,
  onPopularToggle
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {route.from_location} → {route.to_location}
          </CardTitle>
          {route.is_popular && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Star className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm">{route.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Bus className="h-4 w-4 text-purple-600" />
            <span className="text-sm">{route.fleetOptions?.length || 0} Fleet Types</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Departure Times:</p>
          <div className="flex flex-wrap gap-2">
            {route.departure_times?.map((time: string) => (
              <Badge key={time} variant="outline">
                {time}
              </Badge>
            ))}
          </div>
        </div>

        {route.fleetOptions && route.fleetOptions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Fleet Pricing:</p>
            <div className="grid grid-cols-1 gap-2">
              {route.fleetOptions.map((fleet) => (
                <div key={fleet.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium">{fleet.name}</span>
                    <div className="text-xs text-muted-foreground">
                      {fleet.features?.slice(0, 2).join(', ')}
                      {fleet.features?.length > 2 && ` +${fleet.features.length - 2} more`}
                    </div>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">
                    KSh {Number(fleet.price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between gap-2 pt-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(route)}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPricing(route)}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Quick Pricing
            </Button>
          </div>
          
          <div className="flex gap-2">
            <PopularRoutesToggle 
              routeId={route.id} 
              isPopular={route.is_popular}
              onToggle={onPopularToggle}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 border-red-200"
              onClick={() => onDelete(route)}
            >
              <Trash className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
