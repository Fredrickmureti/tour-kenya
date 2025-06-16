
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { saveBookingState, getBookingState } from '@/utils/bookingStateManager';
import { useAuth } from '@/contexts/AuthContext';

export const useBookingForm = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Form state
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [step, setStep] = useState(1);

  // Get parameters from URL
  const routeIdFromUrl = searchParams.get('routeId');
  const branchId = searchParams.get('branchId');
  const fromUrl = searchParams.get('from');
  const toUrl = searchParams.get('to');
  const dateFromUrl = searchParams.get('date');

  // Initialize state from URL parameters or saved booking state
  useEffect(() => {
    // First check URL parameters
    if (fromUrl) setFromLocation(fromUrl);
    if (toUrl) setToLocation(toUrl);
    if (dateFromUrl) {
      try {
        setSelectedDate(new Date(dateFromUrl));
      } catch (error) {
        console.error('Invalid date in URL:', dateFromUrl);
      }
    }

    // Then check for saved booking state
    if (!user) {
      const savedState = getBookingState();
      if (savedState) {
        console.log('Restoring booking state:', savedState);
        if (!fromUrl && savedState.from) setFromLocation(savedState.from);
        if (!toUrl && savedState.to) setToLocation(savedState.to);
        if (!dateFromUrl && savedState.date) {
          try {
            setSelectedDate(new Date(savedState.date));
          } catch (error) {
            console.error('Invalid saved date:', savedState.date);
          }
        }
        if (savedState.time) setSelectedTime(savedState.time);
        if (savedState.seats) setSelectedSeats(savedState.seats);
        if (savedState.step) setStep(savedState.step);
      }
    }
  }, [user, fromUrl, toUrl, dateFromUrl]);

  // Save booking state when not logged in
  useEffect(() => {
    if (!user && (fromLocation || toLocation || selectedDate || selectedTime || selectedSeats.length > 0)) {
      const currentUrl = window.location.pathname + window.location.search;
      saveBookingState({
        from: fromLocation,
        to: toLocation,
        date: selectedDate?.toISOString(),
        time: selectedTime,
        seats: selectedSeats,
        step: step,
        routeId: routeIdFromUrl || undefined,
        branchId: branchId || undefined,
        returnUrl: currentUrl
      });
    }
  }, [user, fromLocation, toLocation, selectedDate, selectedTime, selectedSeats, step, routeIdFromUrl, branchId]);

  const canProceedToStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 2:
        return Boolean(fromLocation && toLocation);
      case 3:
        return Boolean(selectedDate && selectedTime);
      case 4:
        return Boolean(selectedSeats.length > 0);
      default:
        return true;
    }
  };

  return {
    // State
    fromLocation,
    toLocation,
    selectedDate,
    selectedTime,
    selectedSeats,
    paymentMethod,
    step,
    routeIdFromUrl,
    branchId,
    fromUrl,
    toUrl,
    dateFromUrl,
    
    // Setters
    setFromLocation,
    setToLocation,
    setSelectedDate,
    setSelectedTime,
    setSelectedSeats,
    setPaymentMethod,
    setStep,
    
    // Helpers
    canProceedToStep
  };
};
