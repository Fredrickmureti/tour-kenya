
import React from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LocationSelector } from './LocationSelector';
import { FleetPricingInputs } from './FleetPricingInputs';
import { RouteFleetPricing } from '../RouteFleetPricing';
import { RouteFormValues, RouteWithFleet } from './types';

interface RouteDialogsProps {
  // Add dialog props
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isPricingDialogOpen: boolean;
  setIsPricingDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  
  // Forms
  addForm: any;
  editForm: any;
  
  // Data
  selectedRoute: RouteWithFleet | null;
  locations: Array<{ id: string; name: string }>;
  fleetTypes?: Array<{
    id: string;
    name: string;
    base_price_multiplier: number;
    features: string[];
  }>;
  
  // Search states
  fromLocationSearch: string;
  setFromLocationSearch: (search: string) => void;
  toLocationSearch: string;
  setToLocationSearch: (search: string) => void;
  
  // Handlers
  onAddRoute: (values: RouteFormValues) => void;
  onEditRoute: (values: RouteFormValues) => void;
  onDeleteRoute: () => void;
}

export const RouteDialogs: React.FC<RouteDialogsProps> = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isPricingDialogOpen,
  setIsPricingDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  addForm,
  editForm,
  selectedRoute,
  locations,
  fleetTypes,
  fromLocationSearch,
  setFromLocationSearch,
  toLocationSearch,
  setToLocationSearch,
  onAddRoute,
  onEditRoute,
  onDeleteRoute
}) => {
  const filteredFromLocations = locations.filter(location =>
    location.name.toLowerCase().includes(fromLocationSearch.toLowerCase())
  );

  const filteredToLocations = locations.filter(location =>
    location.name.toLowerCase().includes(toLocationSearch.toLowerCase())
  );

  return (
    <>
      {/* Add Route Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddRoute)} className="space-y-4">
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
              
              <FleetPricingInputs form={addForm} fleetTypes={fleetTypes} />
              
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
            <form onSubmit={editForm.handleSubmit(onEditRoute)} className="space-y-4">
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
              
              <FleetPricingInputs form={editForm} fleetTypes={fleetTypes} />
              
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
            <Button variant="destructive" onClick={onDeleteRoute}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
