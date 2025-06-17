
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Bell, MapPin, Star } from 'lucide-react';

interface TravelPreference {
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

const TravelPreferences: React.FC = () => {
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

  React.useEffect(() => {
    if (existingPreferences) {
      setPreferences({
        preferred_seat_type: existingPreferences.preferred_seat_type || 'window',
        email_notifications: existingPreferences.email_notifications ?? true,
        sms_notifications: existingPreferences.sms_notifications ?? false,
        preferred_departure_time: existingPreferences.preferred_departure_time || 'morning',
        accessibility_needs: existingPreferences.accessibility_needs || 'none'
      });
    }
  }, [existingPreferences]);

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Travel Preferences
        </CardTitle>
        <CardDescription>
          Customize your travel experience and notification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="seat-type" className="text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Preferred Seat Type
            </Label>
            <Select
              value={preferences.preferred_seat_type}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, preferred_seat_type: value }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select seat preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="window">Window Seat</SelectItem>
                <SelectItem value="aisle">Aisle Seat</SelectItem>
                <SelectItem value="any">No Preference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="departure-time" className="text-sm font-medium">
              Preferred Departure Time
            </Label>
            <Select
              value={preferences.preferred_departure_time}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, preferred_departure_time: value }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select time preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="early-morning">Early Morning (6AM - 9AM)</SelectItem>
                <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
                <SelectItem value="evening">Evening (6PM - 10PM)</SelectItem>
                <SelectItem value="any">Any Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="accessibility" className="text-sm font-medium">
              Accessibility Needs
            </Label>
            <Select
              value={preferences.accessibility_needs}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, accessibility_needs: value }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select accessibility needs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Special Needs</SelectItem>
                <SelectItem value="wheelchair">Wheelchair Access</SelectItem>
                <SelectItem value="assistance">Boarding Assistance</SelectItem>
                <SelectItem value="vision">Vision Assistance</SelectItem>
                <SelectItem value="hearing">Hearing Assistance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-4 flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notification Preferences
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive booking confirmations and updates via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, email_notifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications" className="text-sm font-medium">
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive booking updates and reminders via SMS
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={preferences.sms_notifications}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, sms_notifications: checked }))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSavePreferences}
            disabled={updatePreferencesMutation.isPending}
          >
            {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelPreferences;
