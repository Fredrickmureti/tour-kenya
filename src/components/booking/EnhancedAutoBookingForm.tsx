
import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { saveBookingState, clearBookingState } from '@/utils/bookingStateManager';

// Import refactored components
import { useBookingForm } from './hooks/useBookingForm';
import { BookingHeader } from './components/BookingHeader';
import { BookingStepIndicator } from './components/BookingStepIndicator';
import { RouteSelectionStep } from './components/RouteSelectionStep';
import { DateTimeSelectionStep } from './components/DateTimeSelectionStep';
import { SeatSelectionStep } from './components/SeatSelectionStep';
import { PaymentConfirmationStep } from './components/PaymentConfirmationStep';

interface Route {
  id: string;
  from_location: string;
  to_location: string;
  duration: string;
  departure_times: string[];
  price: number;
  branch_id: string;
}

interface BookingResponse {
  booking_id: string;
  receipt_id: string;
  receipt_number: string;
  amount_paid: number;
  payment_date: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  departure_time: string;
  seat_numbers: string[];
  branch_id: string;
}

const EnhancedAutoBookingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const {
    fromLocation,
    toLocation,
    selectedDate,
    selectedTime,
    selectedSeats,
    paymentMethod,
    step,
    routeIdFromUrl,
    branchId,
    setFromLocation,
    setToLocation,
    setSelectedDate,
    setSelectedTime,
    setSelectedSeats,
    setPaymentMethod,
    setStep,
    canProceedToStep
  } = useBookingForm();

  // Fetch available routes
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['available-routes', branchId],
    queryFn: async () => {
      let query = supabase
        .from('routes')
        .select('*')
        .order('from_location');
      
      if (branchId) {
        query = query.eq('branch_id', branchId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Get available branches for booking
  const { data: branches } = useQuery({
    queryKey: ['branches-for-booking'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_branches_for_booking');
      if (error) throw error;
      return data || [];
    },
  });

  // Filter routes based on selected locations or route ID
  const availableRoutes = routes?.filter(route => {
    if (routeIdFromUrl) {
      return route.id === routeIdFromUrl;
    }
    if (!fromLocation || !toLocation) return false;
    return route.from_location === fromLocation && route.to_location === toLocation;
  }) || [];

  const selectedRoute = availableRoutes[0]; // Take first matching route

  // Auto-progress if route is pre-selected and step 1 is current
  useEffect(() => {
    if (routeIdFromUrl && selectedRoute && step === 1) {
      setFromLocation(selectedRoute.from_location);
      setToLocation(selectedRoute.to_location);
      setStep(2);
    }
  }, [routeIdFromUrl, selectedRoute, step, setFromLocation, setToLocation, setStep]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      if (!user || !selectedRoute) throw new Error('Missing required data');

      // Find the appropriate branch - prefer route's branch or use first available
      const targetBranchId = selectedRoute.branch_id || branches?.[0]?.id;
      
      if (!targetBranchId) {
        throw new Error('No branch available for booking');
      }

      const { data, error } = await supabase.rpc('create_booking_with_branch', {
        p_user_id: user.id,
        p_route_id: selectedRoute.id,
        p_from_location: fromLocation,
        p_to_location: toLocation,
        p_departure_date: format(selectedDate!, 'yyyy-MM-dd'),
        p_departure_time: selectedTime,
        p_arrival_time: '18:00', // Default arrival time
        p_seat_numbers: selectedSeats.map(seat => seat.toString()), // Convert numbers to strings
        p_price: selectedRoute.price * selectedSeats.length,
        p_status: 'upcoming',
        p_branch_id: targetBranchId
      });

      if (error) throw error;
      return data as unknown as BookingResponse;
    },
    onSuccess: (data) => {
      toast.success('Booking created successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      
      // Clear saved booking state on successful booking
      clearBookingState();
      
      // Navigate to receipt page if available
      if (data?.receipt_id) {
        navigate(`/dashboard/receipt/${data.receipt_id}`);
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      console.error('Booking error:', error);
      toast.error(`Failed to create booking: ${error.message}`);
    },
  });

  const handleBooking = () => {
    if (!user) {
      toast.error('Please log in to make a booking');
      // Save current state before redirecting to login
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
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (!selectedDate || !selectedTime || selectedSeats.length === 0) {
      toast.error('Please complete all booking details');
      return;
    }

    createBookingMutation.mutate({});
  };

  const totalPrice = selectedRoute ? selectedRoute.price * selectedSeats.length : 0;

  // Get unique departure locations
  const departureLocations = [...new Set(routes?.map(r => r.from_location) || [])];
  // Get unique arrival locations
  const arrivalLocations = [...new Set(routes?.map(r => r.to_location) || [])];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BookingHeader 
        routeIdFromUrl={routeIdFromUrl}
        branchId={branchId}
        branches={branches}
      />

      <BookingStepIndicator currentStep={step} />

      {/* Step 1: Select Route (Skip if pre-selected) */}
      {step === 1 && !routeIdFromUrl && (
        <RouteSelectionStep
          fromLocation={fromLocation}
          toLocation={toLocation}
          onFromLocationChange={setFromLocation}
          onToLocationChange={setToLocation}
          onNextStep={() => setStep(2)}
          canProceed={canProceedToStep(2)}
          routes={routes}
          departureLocations={departureLocations}
          arrivalLocations={arrivalLocations}
        />
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && selectedRoute && (
        <DateTimeSelectionStep
          selectedRoute={selectedRoute}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
          onNextStep={() => setStep(3)}
          onPrevStep={() => setStep(1)}
          canProceed={canProceedToStep(3)}
          routeIdFromUrl={routeIdFromUrl}
        />
      )}

      {/* Step 3: Select Seats */}
      {step === 3 && selectedRoute && selectedDate && selectedTime && (
        <SeatSelectionStep
          routeId={selectedRoute.id}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedSeats={selectedSeats}
          onSeatsChange={setSelectedSeats}
          onNextStep={() => setStep(4)}
          onPrevStep={() => setStep(2)}
          canProceed={canProceedToStep(4)}
        />
      )}

      {/* Step 4: Payment & Confirmation */}
      {step === 4 && selectedDate && (
        <PaymentConfirmationStep
          fromLocation={fromLocation}
          toLocation={toLocation}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedSeats={selectedSeats}
          totalPrice={totalPrice}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          onBooking={handleBooking}
          onPrevStep={() => setStep(3)}
          isProcessing={createBookingMutation.isPending}
        />
      )}

      {routesLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default EnhancedAutoBookingForm;
