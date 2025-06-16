
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useManualBookingRoutes, useLocationOptions } from './hooks/useManualBookingRoutes';
import { ManualBookingFormFields } from './manual-booking/ManualBookingFormFields';
import { RouteInfoDisplay } from './manual-booking/RouteInfoDisplay';
import { useManualBookingForm } from './manual-booking/useManualBookingForm';

const ManualBookingForm = () => {
  const { data: routes, isLoading: routesLoading, error: routesError, refetch } = useManualBookingRoutes();
  const { fromLocations, toLocations } = useLocationOptions();
  
  const {
    formData,
    availableTimes,
    selectedRoute,
    isSubmitting,
    handleFieldChange,
    handleSubmit
  } = useManualBookingForm(routes);

  if (routesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manual Booking</CardTitle>
          <CardDescription>Loading routes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (routesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manual Booking</CardTitle>
          <CardDescription>Error loading routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load routes. Please try again.</p>
            <Button onClick={() => refetch()}>Retry Loading Routes</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Manual Booking</CardTitle>
        <CardDescription>Create a booking on behalf of a customer</CardDescription>
      </CardHeader>
      <CardContent>
        {(!routes || routes.length === 0) && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              No routes are available. Please add routes in the Routes Management section first.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ManualBookingFormFields
            formData={formData}
            onFieldChange={handleFieldChange}
            fromLocations={fromLocations}
            toLocations={toLocations}
            availableTimes={availableTimes}
            isLoadingRoutes={routesLoading}
          />

          <RouteInfoDisplay selectedRoute={selectedRoute} />

          <Button 
            type="submit" 
            disabled={isSubmitting || !routes || routes.length === 0} 
            className="w-full"
          >
            {isSubmitting ? 'Creating Booking...' : 'Create Manual Booking'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualBookingForm;
