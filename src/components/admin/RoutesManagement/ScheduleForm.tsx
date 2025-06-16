
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ScheduleFormProps {
  routeId: string;
  onSuccess: () => void;
  onCancel: () => void;
  fleetOptions: Array<{ id: string; name: string }>;
}

const scheduleFormSchema = z.object({
  departure_date: z.string().min(1, 'Departure date is required'),
  departure_time: z.string().min(1, 'Departure time is required'),
  available_seats: z.number().min(1, 'At least 1 seat must be available'),
  bus_id: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  routeId,
  onSuccess,
  onCancel,
  fleetOptions
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      departure_date: new Date().toISOString().split('T')[0],
      departure_time: '08:00',
      available_seats: 40,
      bus_id: fleetOptions[0]?.id || undefined,
    },
  });

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('schedules')
        .insert({
          route_id: routeId,
          departure_date: data.departure_date,
          departure_time: data.departure_time,
          available_seats: data.available_seats,
          bus_id: data.bus_id || null,
        });

      if (error) {
        toast.error(`Failed to create schedule: ${error.message}`);
        console.error('Error creating schedule:', error);
        return;
      }

      toast.success('Schedule created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(`Unexpected error: ${error.message}`);
      console.error('Unexpected error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="departure_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departure Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departure_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departure Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="available_seats"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Seats</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value))} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bus_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bus/Fleet</FormLabel>
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

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ScheduleForm;
