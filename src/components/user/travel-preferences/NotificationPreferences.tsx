
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';

interface NotificationPreferencesProps {
  preferences: any;
  onPreferenceChange: (key: string, value: boolean) => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ 
  preferences, 
  onPreferenceChange 
}) => {
  return (
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
            onCheckedChange={(checked) => onPreferenceChange('email_notifications', checked)}
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
            onCheckedChange={(checked) => onPreferenceChange('sms_notifications', checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
