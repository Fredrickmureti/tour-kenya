
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash, MapPin, Clock, DollarSign, Star, Bus, Search } from 'lucide-react';
import { PopularRoutesToggle } from './RoutesManagement/PopularRoutesToggle';
import { RouteFleetPricing } from './RouteFleetPricing';

// Enhanced route schema to include fleet pricing
const routeSchema = z.object({
  from_location: z.string().min(1, { message: 'From location is required' }),
  to_location: z.string().min(1, { message: 'To location is required' }),
  base_price: z.coerce.number().min(1, { message: 'Base price must be at least 1' }),
  duration: z.string().min(1, { message: 'Duration is required' }),
  departure_times: z.string().min(1, { message: 'At least one departure time is required' }),
  fleet_pricing: z.record(z.coerce.number().min(1, { message: 'Fleet price must be at least 1' })).optional(),
});

type RouteFormValues = z.infer<typeof routeSchema>;

const RoutesManagement = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [fromLocationSearch, setFromLocationSearch] = useState('');
  const [toLocationSearch, setToLocationSearch] = useState('');

  // Fetch available locations for dropdowns
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch available fleet types
  const { data: fleetTypes } = useQuery({
    queryKey: ['fleet-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet')
        .select('*')
        .order('base_price_multiplier');
      if (error) throw error;
      return data || [];
    },
  });

  // Filter locations based on search
  const filteredFromLocations = locations.filter(location =>
    location.name.toLowerCase().includes(fromLocationSearch.toLowerCase())
  );

  const filteredToLocations = locations.filter(location =>
    location.name.toLowerCase().includes(toLocationSearch.toLowerCase())
  );

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

  // Fetch routes with fleet pricing
  const { data: routes, isLoading, refetch } = useQuery({
    queryKey: ['admin-routes'],
    queryFn: async () => {
      const { data: routes, error } = await supabase
        .from('routes')
        .select('*')
        .order('from_location', { ascending: true });
        
      if (error) throw error;

      // Get fleet pricing for each route
      const routesWithPricing = await Promise.all(
        routes.map(async (route) => {
          const { data: fleetPricing } = await supabase
            .from('route_fleet_pricing')
            .select(`
              custom_price,
              fleet:fleet_id (
                id,
                name,
                base_price_multiplier,
                features
              )
            `)
            .eq('route_id', route.id);

          // Get all fleet types for default pricing
          const { data: allFleet } = await supabase
            .from('fleet')
            .select('*')
            .order('base_price_multiplier');

          const fleetOptions = allFleet?.map(fleet => {
            const customPrice = fleetPricing?.find(fp => fp.fleet?.id === fleet.id);
            return {
              ...fleet,
              price: customPrice ? customPrice.custom_price : route.price * fleet.base_price_multiplier
            };
          }) || [];

          return {
            ...route,
            fleetOptions
          };
        })
      );

      return routesWithPricing || [];
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
    try {
      const departure_times = values.departure_times
        .split(',')
        .map(time => time.trim())
        .filter(time => time);
        
      const { data, error } = await supabase
        .from('routes')
        .insert({
          from_location: values.from_location,
          to_location: values.to_location,
          price: values.base_price,
          duration: values.duration,
          departure_times,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Set up fleet pricing
      if (fleetTypes && fleetTypes.length > 0) {
        const fleetPricingData = fleetTypes.map(fleet => ({
          route_id: data.id,
          fleet_id: fleet.id,
          custom_price: values.fleet_pricing?.[fleet.id] || values.base_price * fleet.base_price_multiplier
        }));

        await supabase
          .from('route_fleet_pricing')
          .insert(fleetPricingData);
      }
      
      toast.success('Route added successfully with fleet pricing');
      setIsAddDialogOpen(false);
      addForm.reset();
      refetch();
    } catch (error: any) {
      toast.error(`Error adding route: ${error.message}`);
    }
  };

  // Enhanced edit route handler with fleet pricing
  const handleEditRoute = async (values: RouteFormValues) => {
    if (!selectedRoute) return;
    
    try {
      const departure_times = values.departure_times
        .split(',')
        .map(time => time.trim())
        .filter(time => time);
        
      const { error } = await supabase
        .from('routes')
        .update({
          from_location: values.from_location,
          to_location: values.to_location,
          price: values.base_price,
          duration: values.duration,
          departure_times,
        })
        .eq('id', selectedRoute.id);
        
      if (error) throw error;
      
      // Update fleet pricing
      if (values.fleet_pricing && fleetTypes) {
        // Delete existing pricing
        await supabase
          .from('route_fleet_pricing')
          .delete()
          .eq('route_id', selectedRoute.id);
        
        // Insert new pricing
        const fleetPricingData = fleetTypes.map(fleet => ({
          route_id: selectedRoute.id,
          fleet_id: fleet.id,
          custom_price: values.fleet_pricing![fleet.id] || values.base_price * fleet.base_price_multiplier
        }));

        await supabase
          .from('route_fleet_pricing')
          .insert(fleetPricingData);
      }
      
      toast.success('Route updated successfully');
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Error updating route: ${error.message}`);
    }
  };

  // Delete route
  const handleDeleteRoute = async () => {
    if (!selectedRoute) return;
    
    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', selectedRoute.id);
        
      if (error) throw error;
      
      toast.success('Route deleted successfully');
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Error deleting route: ${error.message}`);
    }
  };

  // Location selection component with search
  const LocationSelector = ({ 
    value, 
    onValueChange, 
    placeholder, 
    searchValue, 
    onSearchChange, 
    filteredLocations 
  }: {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filteredLocations: any[];
  }) => (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="flex items-center px-3 pb-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search locations..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full bg-transparent border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        {filteredLocations.map((location) => (
          <SelectItem key={location.id} value={location.name}>
            {location.name}
          </SelectItem>
        ))}
        {filteredLocations.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No locations found
          </div>
        )}
      </SelectContent>
    </Select>
  );

  // Fleet pricing input component
  const FleetPricingInputs = ({ form }: { form: any }) => {
    const basePrice = form.watch('base_price') || 0;
    
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
          {fleetTypes?.map((fleet) => {
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
          {routes?.map((route: any) => (
            <Card key={route.id} className="overflow-hidden">
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

                {/* Enhanced Fleet Pricing Preview */}
                {route.fleetOptions && route.fleetOptions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Fleet Pricing:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {route.fleetOptions.map((fleet: any) => (
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
                      onClick={() => {
                        setSelectedRoute(route);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedRoute(route);
                        setIsPricingDialogOpen(true);
                      }}
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      Quick Pricing
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <PopularRoutesToggle 
                      routeId={route.id} 
                      isPopular={route.is_popular}
                      onToggle={handlePopularToggle}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200"
                      onClick={() => {
                        setSelectedRoute(route);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Route Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddRoute)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="from_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Location</FormLabel>
                      <FormControl>
                        <LocationSelector
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select departure location"
                          searchValue={fromLocationSearch}
                          onSearchChange={setFromLocationSearch}
                          filteredLocations={filteredFromLocations}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="to_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Location</FormLabel>
                      <FormControl>
                        <LocationSelector
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select destination"
                          searchValue={toLocationSearch}
                          onSearchChange={setToLocationSearch}
                          filteredLocations={filteredToLocations}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="base_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (KSh)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 3 hours" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addForm.control}
                name="departure_times"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Times (comma separated)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="08:00, 12:00, 16:00..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FleetPricingInputs form={addForm} />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Route</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Route Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditRoute)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="from_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Location</FormLabel>
                      <FormControl>
                        <LocationSelector
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select departure location"
                          searchValue={fromLocationSearch}
                          onSearchChange={setFromLocationSearch}
                          filteredLocations={filteredFromLocations}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="to_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Location</FormLabel>
                      <FormControl>
                        <LocationSelector
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select destination"
                          searchValue={toLocationSearch}
                          onSearchChange={setToLocationSearch}
                          filteredLocations={filteredToLocations}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="base_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (KSh)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="departure_times"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Times (comma separated)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FleetPricingInputs form={editForm} />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Fleet Pricing Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fleet Pricing - {selectedRoute?.from_location} → {selectedRoute?.to_location}</DialogTitle>
          </DialogHeader>
          {selectedRoute && (
            <RouteFleetPricing 
              routeId={selectedRoute.id} 
              basePrice={selectedRoute.price} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Route Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Route</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the route <strong>{selectedRoute?.from_location} → {selectedRoute?.to_location}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoute}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoutesManagement;
