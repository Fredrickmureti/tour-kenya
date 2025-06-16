
import React from 'react';
import { RouteOption } from '../hooks/useManualBookingRoutes';

interface RouteInfoDisplayProps {
  selectedRoute: RouteOption | null;
}

export const RouteInfoDisplay: React.FC<RouteInfoDisplayProps> = ({ selectedRoute }) => {
  if (!selectedRoute) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-medium text-blue-900">Route Information</h4>
      <p className="text-blue-700">
        Price per seat: KES {selectedRoute.price?.toLocaleString()}
      </p>
      <p className="text-blue-700">
        Duration: {selectedRoute.duration}
      </p>
    </div>
  );
};
