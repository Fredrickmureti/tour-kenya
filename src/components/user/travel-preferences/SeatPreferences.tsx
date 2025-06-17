
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface SeatPreferencesProps {
  preferences: any;
  onPreferenceChange: (key: string, value: string) => void;
}

const SeatPreferences: React.FC<SeatPreferencesProps> = ({ preferences, onPreferenceChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="seat-type" className="text-sm font-medium flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Preferred Seat Type
        </Label>
        <Select
          value={preferences.preferred_seat_type}
          onValueChange={(value) => onPreferenceChange('preferred_seat_type', value)}
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
          onValueChange={(value) => onPreferenceChange('preferred_departure_time', value)}
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
          onValueChange={(value) => onPreferenceChange('accessibility_needs', value)}
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
  );
};

export default SeatPreferences;
