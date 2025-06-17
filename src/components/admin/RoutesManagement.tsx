
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { routeSchema, RouteFormValues, RouteWithFleet } from './RoutesManagement/types';
import { RouteCard } from './RoutesManagement/RouteCard';
import { RouteDialogs } from './RoutesManagement/RouteDialogs';
import { useRoutesData } from './RoutesManagement/useRoutesData';

const RoutesManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteWithFleet | null>(null);
  const [fromLocationSearch, setFromLocationSearch] = useState('');
  const [toLocationSearch, setToLocationSearch] = useState('');

  const {
    locations,
    fleetTypes,
    routes,
    isLoading,
    refetch,
    addRoute,
    editRoute,
    deleteRoute,
  } = useRoutesData();

  // Create form with enhanced defaults
  const addForm = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      from_location: '',
      to_location: '',
      base_price: 0,
      duration: '',
      departure_times: '',
      fleet_pricing: {},
    },
  });

  // Edit form with enhanced defaults
  const editForm = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      from_location: '',
      to_location: '',
      base_price: 0,
      duration: '',
      departure_times: '',
      fleet_pricing: {},
    },
  });

  // Set edit form values with fleet pricing
  React.useEffect(() => {
    if (selectedRoute && fleetTypes) {
      editForm.setValue('from_location', selectedRoute.from_location);
      editForm.setValue('to_location', selectedRoute.to_location);
      editForm.setValue('base_price', selectedRoute.price);
      editForm.setValue('duration', selectedRoute.duration);
      editForm.setValue('departure_times', selectedRoute.departure_times.join(', '));
      
      // Set existing fleet pricing
      const fleetPricing: Record<string, number> = {};
      selectedRoute.fleetOptions?.forEach((fleet: any) => {
        fleetPricing[fleet.id] = fleet.price;
      });
      editForm.setValue('fleet_pricing', fleetPricing);
    }
  }, [selectedRoute, fleetTypes, editForm]);

  // Handle popular toggle
  const handlePopularToggle = (routeId: string, isPopular: boolean) => {
    refetch();
  };

  // Enhanced add route handler with fleet pricing
  const handleAddRoute = async (values: RouteFormValues) => {
    addRoute(values);
    setIsAddDialogOpen(false);
    addForm.reset();
  };

  // Enhanced edit route handler with fleet pricing
  const handleEditRoute = async (values: RouteFormValues) => {
    if (!selectedRoute) return;
    
    editRoute({ values, routeId: selectedRoute.id });
    setIsEditDialogOpen(false);
  };

  // Delete route
  const handleDeleteRoute = async () => {
    if (!selectedRoute) return;
    
    deleteRoute(selectedRoute.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Routes Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Route
        </Button>
      </div>
      
      {/* Routes Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : routes?.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">No routes found</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first route
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {routes?.map((route: RouteWithFleet) => (
            <RouteCard
              key={route.id}
              route={route}
              onEdit={(route) => {
                setSelectedRoute(route);
                setIsEditDialogOpen(true);
              }}
              onPricing={(route) => {
                setSelectedRoute(route);
                setIsPricingDialogOpen(true);
              }}
              onDelete={(route) => {
                setSelectedRoute(route);
                setIsDeleteDialogOpen(true);
              }}
              onPopularToggle={handlePopularToggle}
            />
          ))}
        </div>
      )}
      
      <RouteDialogs
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isPricingDialogOpen={isPricingDialogOpen}
        setIsPricingDialogOpen={setIsPricingDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        addForm={addForm}
        editForm={editForm}
        selectedRoute={selectedRoute}
        locations={locations}
        fleetTypes={fleetTypes}
        fromLocationSearch={fromLocationSearch}
        setFromLocationSearch={setFromLocationSearch}
        toLocationSearch={toLocationSearch}
        setToLocationSearch={setToLocationSearch}
        onAddRoute={handleAddRoute}
        onEditRoute={handleEditRoute}
        onDeleteRoute={handleDeleteRoute}
      />
    </div>
  );
};

export default RoutesManagement;
