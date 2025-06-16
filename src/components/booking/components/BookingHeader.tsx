
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface BookingHeaderProps {
  routeIdFromUrl?: string | null;
  branchId?: string | null;
  branches?: any[];
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({ 
  routeIdFromUrl, 
  branchId, 
  branches 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-6 w-6 mr-2" />
          Book Your Journey
          {routeIdFromUrl && (
            <Badge variant="secondary" className="ml-2">Pre-selected Route</Badge>
          )}
        </CardTitle>
        <CardDescription>
          {branchId && branches?.find(b => b.id === branchId) && (
            <Badge variant="secondary" className="mr-2">
              {branches.find(b => b.id === branchId)?.name}
            </Badge>
          )}
          Find and book your perfect trip
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
