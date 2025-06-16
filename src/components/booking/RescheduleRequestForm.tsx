import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  route_id: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  departure_time: string;
  seat_numbers: string[];
}

interface Route {
  id: string;
  from_location: string;
  to_location: string;
  departure_times: string[];
  price: number;
}

interface RescheduleRequestFormProps {
  booking: Booking;
  onSuccess: () => void;
  onCancel: () => void;
}

export const RescheduleRequestForm: React.FC<RescheduleRequestFormProps> = ({
  booking,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [newDate, setNewDate] = useState<Date>();
  const [newTime, setNewTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
  const [showPenaltyWarning, setShowPenaltyWarning] = useState<boolean>(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('from_location');

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to load routes');
    }
  };

  // Calculate penalty based on time difference
  const calculatePenalty = () => {
    if (!newDate || !newTime) return 0;
    
    const bookingDateTime = new Date(`${booking.departure_date} ${booking.departure_time}`);
    const newDateTime = new Date(`${newDate.toISOString().split('T')[0]} ${newTime}`);
    const now = new Date();
    
    // Time difference in hours from now to original booking
    const hoursUntilOriginalBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Apply penalty if rescheduling within 24 hours of departure
    if (hoursUntilOriginalBooking <= 24) {
      return 500; // KES 500 penalty
    }
    
    return 0;
  };

  // Update penalty calculation when date/time changes
  React.useEffect(() => {
    const penalty = calculatePenalty();
    setPenaltyAmount(penalty);
    setShowPenaltyWarning(penalty > 0);
  }, [newDate, newTime, booking.departure_date, booking.departure_time]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedRoute || !newDate || !newTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Show confirmation if penalty applies
    if (penaltyAmount > 0) {
      const confirmed = window.confirm(
        `A penalty of KES ${penaltyAmount} will be applied for rescheduling within 24 hours of departure. Do you want to continue?`
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('reschedule_requests')
        .insert({
          booking_id: booking.id,
          user_id: user.id,
          current_route_id: booking.route_id,
          current_departure_date: booking.departure_date,
          current_departure_time: booking.departure_time,
          requested_route_id: selectedRoute,
          requested_departure_date: format(newDate, 'yyyy-MM-dd'),
          requested_departure_time: newTime,
          reason: reason || null,
          fee_amount: penaltyAmount
        });

      if (error) throw error;

      toast.success('Reschedule request submitted successfully. You will be notified once it\'s reviewed.');
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting reschedule request:', error);
      toast.error(`Failed to submit request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRouteData = routes.find(r => r.id === selectedRoute);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Request Booking Reschedule</h3>
        
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h4 className="font-medium mb-2">Current Booking Details:</h4>
          <p className="text-sm">Route: {booking.from_location} → {booking.to_location}</p>
          <p className="text-sm">Date: {format(new Date(booking.departure_date), 'PPP')}</p>
          <p className="text-sm">Time: {booking.departure_time}</p>
          <p className="text-sm">Seats: {booking.seat_numbers.join(', ')}</p>
        </div>
      </div>

      {/* Penalty Warning */}
      {showPenaltyWarning && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Penalty Warning
              </h3>
              <p className="mt-1 text-sm text-orange-700">
                Rescheduling within 24 hours of departure incurs a penalty of <strong>KES {penaltyAmount}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="route">New Route</Label>
        <Select value={selectedRoute} onValueChange={setSelectedRoute} required>
          <SelectTrigger>
            <SelectValue placeholder="Select new route" />
          </SelectTrigger>
          <SelectContent>
            {routes.map((route) => (
              <SelectItem key={route.id} value={route.id}>
                {route.from_location} → {route.to_location} (KES {route.price})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="date">New Departure Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !newDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {newDate ? format(newDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={newDate}
              onSelect={setNewDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {selectedRouteData && (
        <div>
          <Label htmlFor="time">New Departure Time</Label>
          <Select value={newTime} onValueChange={setNewTime} required>
            <SelectTrigger>
              <SelectValue placeholder="Select departure time" />
            </SelectTrigger>
            <SelectContent>
              {selectedRouteData.departure_times.map((time) => (
                <SelectItem key={time} value={time}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {time}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="reason">Reason for Reschedule (Optional)</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a reason for your reschedule request..."
          rows={3}
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Important Notes:</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Your reschedule request will be reviewed by our admin team</li>
          <li>• Additional fees may apply depending on the new route and timing</li>
          <li>• Rescheduling within 24 hours of departure incurs a KES 500 penalty</li>
          <li>• You will be notified via email once your request is processed</li>
          <li>• Seat availability on the new schedule is not guaranteed</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : `Submit Request${penaltyAmount > 0 ? ` (+ KES ${penaltyAmount} penalty)` : ''}`}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default RescheduleRequestForm;
