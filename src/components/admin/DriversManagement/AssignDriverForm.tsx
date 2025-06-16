
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface AssignDriverFormProps {
  driver: {
    id: string;
    full_name: string;
  };
  fleetOptions: Array<{ id: string; name: string }>;
  routeOptions: Array<{ id: string; from_location: string; to_location: string }>;
  onSuccess: () => void;
}

const assignmentFormSchema = z.object({
  bus_id: z.string().optional(),
  route_id: z.string().optional(),
});

type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

export const AssignDriverForm: React.FC<AssignDriverFormProps> = ({
  driver,
  fleetOptions,
  routeOptions,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      bus_id: undefined,
      route_id: undefined,
    },
  });

  const onSubmit = async (data: AssignmentFormData) => {
    setIsSubmitting(true);
    try {
      // First, deactivate any existing assignments for this driver
      const { error: deactivateError } = await supabase
        .from('driver_assignments')
        .update({ status: 'completed' })
        .eq('driver_id', driver.id)
        .eq('status', 'active');

      if (deactivateError) {
        toast.error(`Failed to update existing assignments: ${deactivateError.message}`);
        return;
      }

      // Create new assignment
      const { error: assignmentError } = await supabase
        .from('driver_assignments')
        .insert({
          driver_id: driver.id,
          bus_id: data.bus_id || null,
          route_id: data.route_id || null,
          status: 'active',
        });

      if (assignmentError) {
        toast.error(`Failed to create assignment: ${assignmentError.message}`);
        return;
      }

      toast.success(`Driver ${driver.full_name} assigned successfully`);
      onSuccess();
    } catch (error: any) {
      toast.error(`Unexpected error: ${error.message}`);
      console.error('Error assigning driver:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <h3 className="font-medium">Assigning: {driver.full_name}</h3>
        </div>

        <FormField
          control={form.control}
          name="bus_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bus/Fleet (Optional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fleetOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="route_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route (Optional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {routeOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.from_location} → {option.to_location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Assigning...' : 'Assign Driver'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AssignDriverForm;
