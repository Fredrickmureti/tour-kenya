
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormData } from './FormValidation';

interface FormFieldsProps {
  formData: FormData;
  onFieldChange: (field: string, value: string) => void;
  fromLocations: string[];
  toLocations: string[];
  availableTimes: string[];
  isLoadingRoutes: boolean;
}

export const ManualBookingFormFields: React.FC<FormFieldsProps> = ({
  formData,
  onFieldChange,
  fromLocations,
  toLocations,
  availableTimes,
  isLoadingRoutes
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="passengerName">Passenger Name *</Label>
        <Input
          id="passengerName"
          value={formData.passengerName}
          onChange={(e) => onFieldChange('passengerName', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="passengerPhone">Phone Number</Label>
        <Input
          id="passengerPhone"
          value={formData.passengerPhone}
          onChange={(e) => onFieldChange('passengerPhone', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="passengerEmail">Email</Label>
        <Input
          id="passengerEmail"
          type="email"
          value={formData.passengerEmail}
          onChange={(e) => onFieldChange('passengerEmail', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="fromLocation">From Location *</Label>
        <Select value={formData.fromLocation} onValueChange={(value) => onFieldChange('fromLocation', value)}>
          <SelectTrigger>
            <SelectValue placeholder={isLoadingRoutes ? "Loading..." : "Select departure location"} />
          </SelectTrigger>
          <SelectContent>
            {fromLocations.length > 0 ? (
              fromLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>
                {isLoadingRoutes ? "Loading locations..." : "No departure locations available"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="toLocation">To Location *</Label>
        <Select value={formData.toLocation} onValueChange={(value) => onFieldChange('toLocation', value)}>
          <SelectTrigger>
            <SelectValue placeholder={isLoadingRoutes ? "Loading..." : "Select destination"} />
          </SelectTrigger>
          <SelectContent>
            {toLocations.length > 0 ? (
              toLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>
                {isLoadingRoutes ? "Loading destinations..." : "No destinations available"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="departureDate">Departure Date *</Label>
        <Input
          id="departureDate"
          type="date"
          value={formData.departureDate}
          onChange={(e) => onFieldChange('departureDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div>
        <Label htmlFor="departureTime">Departure Time *</Label>
        <Select value={formData.departureTime} onValueChange={(value) => onFieldChange('departureTime', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {availableTimes.length > 0 ? (
              availableTimes.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>
                {formData.fromLocation && formData.toLocation 
                  ? 'No times available for this route' 
                  : 'Select locations first'}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="seatNumbers">Seat Numbers *</Label>
        <Input
          id="seatNumbers"
          value={formData.seatNumbers}
          onChange={(e) => onFieldChange('seatNumbers', e.target.value)}
          placeholder="e.g., 1, 2, 3"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Enter seat numbers separated by commas
        </p>
      </div>
    </div>
  );
};
