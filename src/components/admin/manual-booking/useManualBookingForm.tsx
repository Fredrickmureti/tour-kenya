
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { RouteOption } from '../hooks/useManualBookingRoutes';
import { FormData, validateFormData, parseSeatNumbers, getInitialFormData } from './FormValidation';

export const useManualBookingForm = (routes: RouteOption[] | undefined) => {
  const { adminUser } = useAdminAuth();
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update available times when route selection changes
  useEffect(() => {
    if (formData.fromLocation && formData.toLocation) {
      const route = routes?.find(r => 
        r.from_location === formData.fromLocation && 
        r.to_location === formData.toLocation
      );
      
      if (route) {
        console.log('Route found:', route);
        setSelectedRoute(route);
        setAvailableTimes(route.departure_times || []);
      } else {
        console.log('No route found for:', formData.fromLocation, '->', formData.toLocation);
        setSelectedRoute(null);
        setAvailableTimes([]);
      }
    } else {
      setSelectedRoute(null);
      setAvailableTimes([]);
    }
  }, [formData.fromLocation, formData.toLocation, routes]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminUser) {
      toast.error('Admin user not found. Please log in again.');
      return;
    }

    const validationError = validateFormData(formData, selectedRoute);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const seatNumbersArray = parseSeatNumbers(formData.seatNumbers);

      if (seatNumbersArray.length === 0) {
        toast.error('Please provide valid seat numbers');
        return;
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: adminUser.id,
          route_id: selectedRoute!.id,
          from_location: formData.fromLocation,
          to_location: formData.toLocation,
          departure_date: formData.departureDate,
          departure_time: formData.departureTime,
          arrival_time: '18:00',
          seat_numbers: seatNumbersArray,
          price: selectedRoute!.price * seatNumbersArray.length,
          status: 'confirmed'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create manual booking record
      const { error: manualBookingError } = await supabase
        .from('manual_bookings')
        .insert({
          booking_id: booking.id,
          admin_email: adminUser.email,
          passenger_name: formData.passengerName,
          passenger_phone: formData.passengerPhone,
          passenger_email: formData.passengerEmail
        });

      if (manualBookingError) throw manualBookingError;

      // Create receipt
      const { error: receiptError } = await supabase
        .from('receipts')
        .insert({
          booking_id: booking.id,
          user_id: adminUser.id,
          amount: selectedRoute!.price * seatNumbersArray.length,
          payment_status: 'Paid',
          payment_method: 'Manual'
        });

      if (receiptError) throw receiptError;

      toast.success('Manual booking created successfully!');
      
      // Reset form
      setFormData(getInitialFormData());

    } catch (error: any) {
      console.error('Error creating manual booking:', error);
      toast.error(`Failed to create booking: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    availableTimes,
    selectedRoute,
    isSubmitting,
    handleFieldChange,
    handleSubmit
  };
};
