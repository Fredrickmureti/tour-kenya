
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBookingFormEnhanced = () => {
  const [searchParams] = useSearchParams();
  
  // Enhanced state management with URL parameter extraction
  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    searchParams.get('date') ? new Date(searchParams.get('date')!) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [selectedFleetName, setSelectedFleetName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [step, setStep] = useState<number>(1);
  
  // URL parameters
  const routeIdFromUrl = searchParams.get('routeId');
  const branchId = searchParams.get('branchId');

  // Fetch route data when routeIdFromUrl exists
  const { data: routeData } = useQuery({
    queryKey: ['route-data', routeIdFromUrl],
    queryFn: async () => {
      if (!routeIdFromUrl) return null;
      
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('id', routeIdFromUrl)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!routeIdFromUrl
  });

  // Auto-populate location data from route when available
  useEffect(() => {
    if (routeData && !fromLocation && !toLocation) {
      setFromLocation(routeData.from_location);
      setToLocation(routeData.to_location);
    }
  }, [routeData, fromLocation, toLocation]);

  // Enhanced step validation
  const canProceedToStep = (targetStep: number): boolean => {
    switch (targetStep) {
      case 2:
        return !!(fromLocation && toLocation);
      case 3:
        return !!(fromLocation && toLocation && selectedDate && selectedTime);
      case 4:
        return !!(fromLocation && toLocation && selectedDate && selectedTime && selectedBusId);
      case 5:
        return !!(fromLocation && toLocation && selectedDate && selectedTime && selectedBusId && selectedSeats.length > 0);
      default:
        return false;
    }
  };

  // Auto-adjust step based on available data
  useEffect(() => {
    if (routeIdFromUrl && routeData && step === 1) {
      setStep(2); // Skip route selection if route is pre-selected
    }
  }, [routeIdFromUrl, routeData, step]);

  const resetForm = () => {
    setFromLocation('');
    setToLocation('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setSelectedSeats([]);
    setSelectedBusId('');
    setSelectedFleetName('');
    setPaymentMethod('card');
    setStep(1);
  };

  return {
    // State
    fromLocation,
    toLocation,
    selectedDate,
    selectedTime,
    selectedSeats,
    selectedBusId,
    selectedFleetName,
    paymentMethod,
    step,
    routeIdFromUrl,
    branchId,
    routeData,
    
    // Setters
    setFromLocation,
    setToLocation,
    setSelectedDate,
    setSelectedTime,
    setSelectedSeats,
    setSelectedBusId,
    setSelectedFleetName,
    setPaymentMethod,
    setStep,
    
    // Utilities
    canProceedToStep,
    resetForm
  };
};
