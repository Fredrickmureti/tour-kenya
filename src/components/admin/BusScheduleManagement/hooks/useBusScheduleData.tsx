
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BusSchedule {
  id: string;
  route_id: string;
  bus_id: string;
  departure_date: string;
  departure_time: string;
  available_seats: number;
  status: string;
  route?: {
    from_location: string;
    to_location: string;
  };
  fleet?: {
    name: string;
    capacity: number;
  };
}

export const useBusScheduleData = (selectedDate?: Date) => {
  const queryClient = useQueryClient();

  // Fetch bus schedules
  const schedulesQuery = useQuery({
    queryKey: ['bus-schedules', selectedDate],
    queryFn: async () => {
      let query = supabase
        .from('bus_schedules')
        .select(`
          *,
          routes:route_id (
            from_location,
            to_location
          ),
          fleet:bus_id (
            name,
            capacity
          )
        `)
        .order('departure_date', { ascending: true })
        .order('departure_time', { ascending: true });

      if (selectedDate) {
        query = query.eq('departure_date', format(selectedDate, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BusSchedule[];
    }
  });

  // Fetch routes
  const routesQuery = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('routes').select('*');
      if (error) throw error;
      return data;
    }
  });

  // Fetch fleet
  const fleetQuery = useQuery({
    queryKey: ['fleet'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fleet').select('*');
      if (error) throw error;
      return data;
    }
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const { data, error } = await supabase
        .from('bus_schedules')
        .insert([scheduleData])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Bus schedule created successfully');
      queryClient.invalidateQueries({ queryKey: ['bus-schedules'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create schedule: ${error.message}`);
    }
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('bus_schedules')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Schedule updated successfully');
      queryClient.invalidateQueries({ queryKey: ['bus-schedules'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update schedule: ${error.message}`);
    }
  });

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bus_schedules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Schedule deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['bus-schedules'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete schedule: ${error.message}`);
    }
  });

  // Wrapper functions to match the expected interface
  const updateSchedule = (id: string, updates: any) => {
    updateScheduleMutation.mutate({ id, updates });
  };

  const deleteSchedule = (id: string) => {
    deleteScheduleMutation.mutate(id);
  };

  const createSchedule = (scheduleData: any) => {
    createScheduleMutation.mutate(scheduleData);
  };

  return {
    schedules: schedulesQuery.data,
    isLoading: schedulesQuery.isLoading,
    routes: routesQuery.data,
    fleet: fleetQuery.data,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    isCreating: createScheduleMutation.isPending,
    isUpdating: updateScheduleMutation.isPending,
    isDeleting: deleteScheduleMutation.isPending
  };
};
