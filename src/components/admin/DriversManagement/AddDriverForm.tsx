import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import bcrypt from 'bcryptjs';
import { useQuery } from '@tanstack/react-query';
import { useBranch } from '@/contexts/BranchContext';
import { DriverCredentialsDisplay } from './DriverCredentialsDisplay';

interface AddDriverFormProps {
  onSuccess: () => void;
}

const baseDriverFormSchema = {
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  license_number: z.string().min(5, 'License number must be at least 5 characters'),
  experience_years: z.number().min(0, 'Experience years must be 0 or greater').default(0),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fleet_id: z.string().optional(),
};

const driverFormSchema = z.object({
  ...baseDriverFormSchema,
  branch_id: z.string().optional(),
});

type DriverFormData = z.infer<typeof driverFormSchema>;

export const AddDriverForm: React.FC<AddDriverFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    driverName: string;
    fleetAssignment?: string;
  } | null>(null);
  
  const { currentBranch, isSuperAdmin, branches: allBranches } = useBranch();

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      license_number: '',
      experience_years: 0,
      password: '',
      fleet_id: undefined,
      branch_id: (isSuperAdmin && currentBranch && typeof currentBranch === 'object') ? currentBranch.id : undefined,
    },
  });

  const watchedBranchIdFormField = form.watch('branch_id');

  const branchIdForFleetFilter = React.useMemo(() => {
    if (isSuperAdmin && currentBranch === 'all') {
      return watchedBranchIdFormField;
    }
    return currentBranch && typeof currentBranch === 'object' ? currentBranch.id : undefined;
  }, [isSuperAdmin, currentBranch, watchedBranchIdFormField]);

  const { data: fleetOptions, isLoading: isLoadingFleet } = useQuery({
    queryKey: ['fleet-options-for-add-driver-form', branchIdForFleetFilter],
    queryFn: async () => {
      if (!branchIdForFleetFilter) return [];
      const { data, error } = await supabase
        .from('fleet')
        .select('id, name')
        .eq('branch_id', branchIdForFleetFilter)
        .order('name');
      if (error) {
        toast.error(`Error fetching fleet: ${error.message}`);
        throw error;
      }
      return data || [];
    },
    enabled: !!branchIdForFleetFilter,
  });
  
  useEffect(() => {
    form.setValue('fleet_id', undefined);
  }, [branchIdForFleetFilter, form]);

  const onSubmit = async (data: DriverFormData) => {
    setIsSubmitting(true);
    try {
      let actualDriverBranchId: string | undefined;

      if (isSuperAdmin && currentBranch === 'all') {
        actualDriverBranchId = data.branch_id;
        if (!actualDriverBranchId) {
          toast.error("Branch selection is required for the driver.");
          form.setError("branch_id", { type: "manual", message: "Branch is required." });
          setIsSubmitting(false);
          return;
        }
      } else if (currentBranch && typeof currentBranch === 'object') {
        actualDriverBranchId = currentBranch.id;
      } else {
        toast.error("Cannot determine branch for the new driver. Admin context is unclear.");
        setIsSubmitting(false);
        return;
      }

      // Check if email already exists
      const { data: existingDriver, error: checkError } = await supabase
        .from('drivers')
        .select('email')
        .eq('email', data.email.toLowerCase())
        .single();

      if (existingDriver) {
        toast.error('A driver with this email already exists');
        setIsSubmitting(false);
        return;
      }

      if (checkError && checkError.code !== 'PGRST116') {
        toast.error(`Error checking email: ${checkError.message}`);
        setIsSubmitting(false);
        return;
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .insert({
          full_name: data.full_name,
          email: data.email.toLowerCase(),
          phone: data.phone || null,
          license_number: data.license_number,
          experience_years: data.experience_years,
          branch_id: actualDriverBranchId,
        })
        .select()
        .single();

      if (driverError) {
        if (driverError.code === '23505' && driverError.message.includes('drivers_email_key')) {
          toast.error('A driver with this email already exists');
        } else {
          toast.error(`Failed to create driver: ${driverError.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      const { error: authError } = await supabase
        .from('driver_auth')
        .insert({
          driver_id: driverData.id,
          email: data.email.toLowerCase(),
          pass_key: hashedPassword,
        });

      if (authError) {
        await supabase.from('drivers').delete().eq('id', driverData.id);
        
        if (authError.code === '23505') {
          toast.error('Authentication record already exists for this email');
        } else {
          toast.error(`Failed to create driver authentication: ${authError.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      let fleetAssignmentName: string | undefined;

      if (data.fleet_id && data.fleet_id !== 'none') {
        const { error: assignmentError } = await supabase
          .from('driver_assignments')
          .insert({
            driver_id: driverData.id,
            bus_id: data.fleet_id,
            status: 'active'
          });

        if (assignmentError) {
          console.error('Error creating fleet assignment:', assignmentError);
          toast.error('Driver created but fleet assignment failed');
        } else {
          const selectedFleet = fleetOptions?.find(f => f.id === data.fleet_id);
          fleetAssignmentName = selectedFleet?.name;
        }
      }

      // Set credentials to display
      setCreatedCredentials({
        email: data.email,
        password: data.password,
        driverName: data.full_name,
        fleetAssignment: fleetAssignmentName
      });
      
      setShowCredentials(true);
      form.reset();
    } catch (error: any) {
      toast.error(`Unexpected error: ${error.message}`);
      console.error('Error creating driver:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCredentialsClose = () => {
    setShowCredentials(false);
    setCreatedCredentials(null);
    onSuccess();
  };

  if (showCredentials && createdCredentials) {
    return (
      <DriverCredentialsDisplay
        email={createdCredentials.email}
        password={createdCredentials.password}
        driverName={createdCredentials.driverName}
        fleetAssignment={createdCredentials.fleetAssignment}
        onClose={handleCredentialsClose}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isSuperAdmin && currentBranch === 'all' && (
          <FormField
            control={form.control}
            name="branch_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign to Branch</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allBranches && allBranches.length > 0 ? (
                      allBranches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>Loading branches...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Login Credential)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Login Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter login password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="license_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter license number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience_years"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience (Years)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter years of experience" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fleet_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign to Fleet (Optional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ''}
                disabled={isLoadingFleet || !branchIdForFleetFilter || !fleetOptions || fleetOptions.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !branchIdForFleetFilter ? "Select a branch first" : 
                      isLoadingFleet ? "Loading fleet..." : 
                      (!fleetOptions || fleetOptions.length === 0) ? "No fleet available for this branch" :
                      "Select fleet"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No specific fleet</SelectItem>
                  {fleetOptions?.map(fleet => (
                    <SelectItem key={fleet.id} value={fleet.id}>
                      {fleet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating Driver...' : 'Create Driver'}
        </Button>
      </form>
    </Form>
  );
};

export default AddDriverForm;
