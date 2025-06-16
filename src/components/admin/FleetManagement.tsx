
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardFooter,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash, X } from 'lucide-react';

const fleetSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  image_url: z.string().url({ message: 'Image URL must be a valid URL' }),
  capacity: z.coerce.number().min(1, { message: 'Capacity must be at least 1' }),
  features: z.string().min(1, { message: 'At least one feature is required' }),
});

type FleetFormValues = z.infer<typeof fleetSchema>;

const FleetManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFleet, setSelectedFleet] = useState<any>(null);

  // Create form
  const addForm = useForm<FleetFormValues>({
    resolver: zodResolver(fleetSchema),
    defaultValues: {
      name: '',
      description: '',
      image_url: '',
      capacity: 0,
      features: '',
    },
  });

  // Edit form
  const editForm = useForm<FleetFormValues>({
    resolver: zodResolver(fleetSchema),
    defaultValues: {
      name: '',
      description: '',
      image_url: '',
      capacity: 0,
      features: '',
    },
  });

  // Fetch fleet
  const { data: fleet, isLoading, refetch } = useQuery({
    queryKey: ['admin-fleet'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
  });

  // Set edit form values when fleet is selected
  React.useEffect(() => {
    if (selectedFleet) {
      editForm.setValue('name', selectedFleet.name);
      editForm.setValue('description', selectedFleet.description);
      editForm.setValue('image_url', selectedFleet.image_url);
      editForm.setValue('capacity', selectedFleet.capacity);
      editForm.setValue('features', selectedFleet.features.join(', '));
    }
  }, [selectedFleet, editForm]);

  // Add new fleet item
  const handleAddFleet = async (values: FleetFormValues) => {
    try {
      const features = values.features
        .split(',')
        .map(feature => feature.trim())
        .filter(feature => feature);
        
      const { error } = await supabase
        .from('fleet')
        .insert({
          name: values.name,
          description: values.description,
          image_url: values.image_url,
          capacity: values.capacity,
          features,
        });
        
      if (error) throw error;
      
      toast.success('Fleet item added successfully');
      setIsAddDialogOpen(false);
      addForm.reset();
      refetch();
    } catch (error: any) {
      toast.error(`Error adding fleet item: ${error.message}`);
    }
  };

  // Update fleet item
  const handleEditFleet = async (values: FleetFormValues) => {
    if (!selectedFleet) return;
    
    try {
      const features = values.features
        .split(',')
        .map(feature => feature.trim())
        .filter(feature => feature);
        
      const { error } = await supabase
        .from('fleet')
        .update({
          name: values.name,
          description: values.description,
          image_url: values.image_url,
          capacity: values.capacity,
          features,
        })
        .eq('id', selectedFleet.id);
        
      if (error) throw error;
      
      toast.success('Fleet item updated successfully');
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Error updating fleet item: ${error.message}`);
    }
  };

  // Delete fleet item
  const handleDeleteFleet = async () => {
    if (!selectedFleet) return;
    
    try {
      const { error } = await supabase
        .from('fleet')
        .delete()
        .eq('id', selectedFleet.id);
        
      if (error) throw error;
      
      toast.success('Fleet item deleted successfully');
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Error deleting fleet item: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fleet Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>
      
      {/* Fleet Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : fleet?.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">No fleet items found</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first vehicle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fleet?.map((item: any) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm line-clamp-3">{item.description}</p>
                <div className="flex items-center">
                  <span className="text-sm font-medium">Capacity:</span>
                  <span className="ml-2 text-sm">{item.capacity} seats</span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.features.map((feature: string) => (
                      <Badge key={`${item.id}-${feature}`} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedFleet(item);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200"
                  onClick={() => {
                    setSelectedFleet(item);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Fleet Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddFleet)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (Seats)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features (comma separated)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Air conditioning, Wi-Fi, USB charging..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Vehicle</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Fleet Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditFleet)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (Seats)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features (comma separated)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vehicle</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the <strong>{selectedFleet?.name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFleet}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FleetManagement;
