
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useTravelPreferences } from './travel-preferences/useTravelPreferences';
import SeatPreferences from './travel-preferences/SeatPreferences';
import NotificationPreferences from './travel-preferences/NotificationPreferences';

const TravelPreferences: React.FC = () => {
  const {
    preferences,
    setPreferences,
    existingPreferences,
    isLoading,
    updatePreferences,
    isUpdating
  } = useTravelPreferences();

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
  }, [existingPreferences, setPreferences]);

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSavePreferences = () => {
    updatePreferences(preferences);
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
        <SeatPreferences
          preferences={preferences}
          onPreferenceChange={handlePreferenceChange}
        />

        <NotificationPreferences
          preferences={preferences}
          onPreferenceChange={handlePreferenceChange}
        />

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSavePreferences}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelPreferences;
