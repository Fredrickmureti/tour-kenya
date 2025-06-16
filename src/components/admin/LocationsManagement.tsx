import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, Pencil, Trash } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import type { Branch } from '@/contexts/BranchContext'; // Correctly import Branch type

const locationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, { message: 'Name is required' }),
  type: z.enum(['from', 'to'], { required_error: 'Type is required' }),
  branch_id: z.string().uuid({ message: "Invalid Branch ID" }).optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface LocationFromDB {
  id: string;
  name: string;
  type: 'from' | 'to';
  created_at: string;
  branch_id: string | null;
  branches?: { name: string } | null; // For joined data from 'branches' table
}

const LocationsManagement = () => {
  const { currentBranch, isSuperAdmin, getCurrentBranchFilter, branches } = useBranch(); // Use `branches` from context
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationFromDB | null>(null);

  const getActiveBranchId = (): string | undefined => {
    if (currentBranch && typeof currentBranch !== 'string') {
        return (currentBranch as Branch).id;
    }
    return undefined;
  };
  
  const defaultBranchIdForForms = getActiveBranchId(); // Changed: Use getActiveBranchId() for all roles

  const addForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      type: undefined, // Initialize as undefined for enum
      branch_id: defaultBranchIdForForms,
    },
  });

  const editForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: { // Will be reset by useEffect
      name: '',
      type: undefined,
      branch_id: undefined,
    },
  });

  const queryKeyLocations = ['admin-locations-manager', getActiveBranchId(), isSuperAdmin];

  const { data: locations, isLoading, refetch } = useQuery<LocationFromDB[], Error>({
    queryKey: queryKeyLocations,
    queryFn: async () => {
      let query = supabase
        .from('locations')
        .select('id, name, type, branch_id, branches(name)'); // Ensure join alias matches LocationFromDB

      const filterDetails = getCurrentBranchFilter();
      // Fixed: Check if filterDetails is not null before accessing properties
      if (filterDetails) {
        query = query.eq('branch_id', filterDetails);
      }

      const { data, error } = await query.order('name', { ascending: true });
        
      if (error) {
        console.error("Error fetching locations:", error);
        toast.error(`Failed to fetch locations: ${error.message}`);
        throw error;
      }
      return (data as LocationFromDB[]) || [];
    },
    enabled: !!(isSuperAdmin || getActiveBranchId()), 
  });

  const handleAddLocation = async (values: LocationFormValues) => {
    try {
      const branchIdToSet = isSuperAdmin ? values.branch_id : getActiveBranchId();
      if (!branchIdToSet) {
        toast.error(isSuperAdmin ? 'Super admin must select a branch.' : 'Branch context is not available.');
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from('locations')
        .select('id', { count: 'exact' })
        .eq('name', values.name)
        .eq('type', values.type)
        .eq('branch_id', branchIdToSet);

      if (existingError) throw existingError;
        
      if (existing && existing.length > 0) {
        toast.error(`A location with this name and type already exists for this branch.`);
        return;
      }
      
      const { error: insertError } = await supabase
        .from('locations')
        .insert({
          name: values.name,
          type: values.type,
          branch_id: branchIdToSet,
        });
        
      if (insertError) throw insertError;
      
      toast.success('Location added successfully');
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeyLocations });
    } catch (error: any) {
      toast.error(`Error adding location: ${error.message}`);
    }
  };

  const handleEditLocation = async (values: LocationFormValues) => {
    if (!selectedLocation || !values.id) {
        toast.error("No location selected or ID missing for edit.");
        return;
    }

    const branchIdToSet = isSuperAdmin ? values.branch_id : selectedLocation.branch_id;
    if (isSuperAdmin && !branchIdToSet) {
        toast.error('Super admin must ensure a branch is associated when editing a location.');
        return;
    }
    
    try {
      const { data: existing, error: existingError } = await supabase
        .from('locations')
        .select('id', { count: 'exact' })
        .eq('name', values.name)
        .eq('type', values.type)
        .eq('branch_id', branchIdToSet!) // branchIdToSet should be valid here
        .neq('id', values.id);

      if (existingError) throw existingError;
        
      if (existing && existing.length > 0) {
        toast.error(`Another location with this name and type already exists for this branch.`);
        return;
      }
      
      const updateData: { name: string; type: 'from' | 'to'; branch_id?: string | null } = {
        name: values.name,
        type: values.type,
      };

      if (isSuperAdmin) { // Superadmin can change branch_id
        updateData.branch_id = branchIdToSet || null;
      } else { // Branch admin cannot change branch_id, it remains selectedLocation.branch_id
        updateData.branch_id = selectedLocation.branch_id;
      }

      const { error: updateError } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', values.id);
        
      if (updateError) throw updateError;
      
      toast.success('Location updated successfully');
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeyLocations });
    } catch (error: any) {
      toast.error(`Error updating location: ${error.message}`);
    }
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;
    
    try {
      const { data: fromRoutes, error: fromError } = await supabase
        .from('routes')
        .select('id', { count: 'exact' })
        .eq('from_location', selectedLocation.name)
        .eq('branch_id', selectedLocation.branch_id); // Assuming routes are also branch_specific
        
      if (fromError) throw fromError;

      const { data: toRoutes, error: toError } = await supabase
        .from('routes')
        .select('id', { count: 'exact' })
        .eq('to_location', selectedLocation.name)
        .eq('branch_id', selectedLocation.branch_id); // Assuming routes are also branch_specific
        
      if (toError) throw toError;
        
      const isUsed = (fromRoutes?.length || 0) > 0 || (toRoutes?.length || 0) > 0;
      
      if (isUsed) {
        toast.error('This location is being used in one or more routes for its branch and cannot be deleted.');
        setIsDeleteDialogOpen(false);
        return;
      }
      
      const { error: deleteError } = await supabase
        .from('locations')
        .delete()
        .eq('id', selectedLocation.id);
        
      if (deleteError) throw deleteError;
      
      toast.success('Location deleted successfully');
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeyLocations });
    } catch (error: any) {
      toast.error(`Error deleting location: ${error.message}`);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      editForm.reset({
        id: selectedLocation.id,
        name: selectedLocation.name,
        type: selectedLocation.type,
        branch_id: selectedLocation.branch_id || defaultBranchIdForForms,
      });
    } else { // For Add dialog or when no selection
      editForm.reset({
        name: '',
        type: undefined,
        branch_id: defaultBranchIdForForms,
      });
    }
  }, [selectedLocation, editForm, defaultBranchIdForForms]);

  useEffect(() => {
    // Reset add form when dialog opens/closes or relevant context changes
    if (isAddDialogOpen) { // Also reset/re-initialize when opening
        addForm.reset({ name: '', type: undefined, branch_id: defaultBranchIdForForms });
    } else {
        addForm.reset({ name: '', type: undefined, branch_id: defaultBranchIdForForms });
    }
  }, [isAddDialogOpen, defaultBranchIdForForms, addForm]);

  const fromLocations = locations?.filter((loc) => loc.type === 'from') || [];
  const toLocations = locations?.filter((loc) => loc.type === 'to') || [];

  const getEmptyStateMessage = (locationType: string) => {
    const activeBranch = getActiveBranchId();
    if (isSuperAdmin && !activeBranch) {
      return `No ${locationType} locations found for All Branches.`;
    }
    if (activeBranch) {
      const branchName = branches.find(b => b.id === activeBranch)?.name;
      return `No ${locationType} locations found for ${branchName || 'the current branch'}.`;
    }
    return `No ${locationType} locations found.`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Locations Management</h2>
        <Button onClick={() => {
          // Reset form with current context before opening
          addForm.reset({ name: '', type: undefined, branch_id: defaultBranchIdForForms });
          setIsAddDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>
      
      {/* Departure Locations */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Departure Locations</h3>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[100px]">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : fromLocations.length === 0 ? (
          <div className="text-center py-4 border rounded-md bg-gray-50">
            <p className="text-muted-foreground">{getEmptyStateMessage('departure')}</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  {isSuperAdmin && <TableHead>Branch</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fromLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={location.type === 'from' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"}>
                        {location.type}
                      </Badge>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        {location.branches?.name || 'N/A'}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedLocation(location);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            setSelectedLocation(location);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Destination Locations */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Destination Locations</h3>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[100px]">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : toLocations.length === 0 ? (
          <div className="text-center py-4 border rounded-md bg-gray-50">
             <p className="text-muted-foreground">{getEmptyStateMessage('destination')}</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  {isSuperAdmin && <TableHead>Branch</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>
                       <Badge variant="outline" className={location.type === 'from' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"}>
                        {location.type}
                      </Badge>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        {location.branches?.name || 'N/A'}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedLocation(location);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            setSelectedLocation(location);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Add Location Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
        setIsAddDialogOpen(isOpen);
        if (!isOpen) {
            addForm.reset({ name: '', type: undefined, branch_id: defaultBranchIdForForms });
        } else {
            // Ensure form is reset with current defaultBranchIdForForms when dialog opens
            addForm.reset({ name: '', type: undefined, branch_id: defaultBranchIdForForms });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddLocation)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Nairobi Central" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""} // Ensure value is not undefined for Select
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="from">Departure (From)</SelectItem>
                        <SelectItem value="to">Destination (To)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isSuperAdmin && (
                <FormField
                  control={addForm.control}
                  name="branch_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""} // Ensure value is not undefined for Select
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addForm.formState.isSubmitting}>
                  {addForm.formState.isSubmitting ? 'Adding...' : 'Add Location'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
        setIsEditDialogOpen(isOpen);
        if (!isOpen) setSelectedLocation(null); // Clear selection on close
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditLocation)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Mombasa Town" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""} // Ensure value is not undefined for Select
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="from">Departure (From)</SelectItem>
                        <SelectItem value="to">Destination (To)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isSuperAdmin && (
                <FormField
                  control={editForm.control}
                  name="branch_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""} // Ensure value is not undefined for Select if it can be null/undefined
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete the location "{selectedLocation?.name}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteLocation} disabled={isLoading}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationsManagement;
