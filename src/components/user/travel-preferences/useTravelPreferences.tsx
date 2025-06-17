
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TravelPreference {
  id: string;
  user_id: string;
  preferred_seat_type: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  preferred_departure_time: string;
  accessibility_needs: string;
  created_at: string;
  updated_at: string;
}

export const useTravelPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [preferences, setPreferences] = useState({
    preferred_seat_type: 'window',
    email_notifications: true,
    sms_notifications: false,
    preferred_departure_time: 'morning',
    accessibility_needs: 'none'
  });

  const { data: existingPreferences, isLoading } = useQuery({
    queryKey: ['travel-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('travel_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('travel_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-preferences'] });
      toast.success('Travel preferences updated successfully');
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    },
  });

  return {
    preferences,
    setPreferences,
    existingPreferences,
    isLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending
  };
};
