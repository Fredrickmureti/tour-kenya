
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { saveBookingState } from '@/utils/bookingStateManager';
import { useAuth } from '@/contexts/AuthContext';

// Import components
import { useBookingFormEnhanced } from './hooks/useBookingFormEnhanced';
import { useFleetManagement } from './hooks/useFleetManagement';
import { useBookingData } from './hooks/useBookingData';
import { useBookingMutation } from './hooks/useBookingMutation';
import { BookingHeader } from './components/BookingHeader';
import { BookingStepIndicatorEnhanced } from './components/BookingStepIndicatorEnhanced';
import { RouteSelectionStep } from './components/RouteSelectionStep';
import { DateTimeSelectionStep } from './components/DateTimeSelectionStep';
import { FleetSelectionStep } from './components/FleetSelectionStep';
import { PaymentConfirmationStep } from './components/PaymentConfirmationStep';
import EnhancedSeatSelectorWithBus from './EnhancedSeatSelectorWithBus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateTotalPrice } from './utils/bookingCalculations';

const EnhancedAutoBookingFormWithFleet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { assignBusToBooking } = useFleetManagement();
  
  // Add fleet pricing state
  const [fleetPriceMultiplier, setFleetPriceMultiplier] = useState<number>(1.0);
  
  const {
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
    setFromLocation,
    setToLocation,
    setSelectedDate,
    setSelectedTime,
    setSelectedSeats,
    setSelectedBusId,
    setSelectedFleetName,
    setPaymentMethod,
    setStep,
    canProceedToStep
  } = useBookingFormEnhanced();

  const { routes, branches, routesLoading } = useBookingData(branchId);

  // Use routeData from hook instead of filtering routes
  const selectedRoute = routeData || (routes?.find(route => {
    if (routeIdFromUrl) {
      return route.id === routeIdFromUrl;
    }
    if (!fromLocation || !toLocation) return false;
    return route.from_location === fromLocation && route.to_location === toLocation;
  }));

  // Auto-progress if route is pre-selected and data is loaded
  useEffect(() => {
    if (routeIdFromUrl && routeData && step === 1) {
      setStep(2);
    }
  }, [routeIdFromUrl, routeData, step, setStep]);

  // Handle bus selection with assignment and pricing
  const handleBusSelect = async (busId: string, fleetName: string, priceMultiplier: number) => {
    setSelectedBusId(busId);
    setSelectedFleetName(fleetName);
    setFleetPriceMultiplier(priceMultiplier);
    
    if (selectedRoute && selectedDate && selectedTime) {
      // Verify bus assignment
      const assignment = await assignBusToBooking(
        selectedRoute.id,
        format(selectedDate, 'yyyy-MM-dd'),
        selectedTime,
        busId,
        1
      );
      
      if (assignment && assignment.is_fallback) {
        // Update with fallback bus
        setSelectedBusId(assignment.assigned_bus_id);
        setSelectedFleetName(assignment.fleet_name);
      }
    }
  };

  // Create booking mutation
  const bookingFormData = {
    fromLocation,
    toLocation,
    selectedDate,
    selectedTime,
    selectedSeats,
    selectedBusId,
    selectedFleetName,
    paymentMethod,
    fleetPriceMultiplier
  };

  const createBookingMutation = useBookingMutation({
    bookingData: bookingFormData,
    selectedRoute,
    branches
  });

  const handleBooking = () => {
    if (!user) {
      toast.error('Please log in to make a booking');
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

    if (!selectedDate || !selectedTime || selectedSeats.length === 0 || !selectedBusId) {
      toast.error('Please complete all booking details');
      return;
    }

    createBookingMutation.mutate();
  };

  // Calculate total price with fleet multiplier
  const totalPrice = calculateTotalPrice(selectedRoute, fleetPriceMultiplier, selectedSeats.length);
  const departureLocations = [...new Set(routes?.map(r => r.from_location) || [])];
  const arrivalLocations = [...new Set(routes?.map(r => r.to_location) || [])];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-20">
      <BookingHeader 
        routeIdFromUrl={routeIdFromUrl}
        branchId={branchId}
        branches={branches}
      />

      <BookingStepIndicatorEnhanced currentStep={step} totalSteps={5} />

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

      {/* Step 3: Select Fleet Type */}
      {step === 3 && selectedRoute && selectedDate && selectedTime && (
        <FleetSelectionStep
          routeId={selectedRoute.id}
          departureDate={selectedDate}
          departureTime={selectedTime}
          selectedBusId={selectedBusId}
          selectedFleetName={selectedFleetName}
          onBusSelect={handleBusSelect}
          onNextStep={() => setStep(4)}
          onPrevStep={() => setStep(2)}
          canProceed={canProceedToStep(4)}
        />
      )}

      {/* Step 4: Select Seats */}
      {step === 4 && selectedRoute && selectedDate && selectedTime && selectedBusId && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Choose Your Seats</CardTitle>
            <CardDescription>
              Select your preferred seats on the {selectedFleetName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedSeatSelectorWithBus
              routeId={selectedRoute.id}
              departureDate={format(selectedDate, 'yyyy-MM-dd')}
              departureTime={selectedTime}
              busId={selectedBusId}
              fleetName={selectedFleetName}
              selectedSeats={selectedSeats}
              onSeatsChange={setSelectedSeats}
            />

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back to Bus Selection
              </Button>
              <Button 
                onClick={() => setStep(5)} 
                disabled={!canProceedToStep(5)}
              >
                Continue to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Payment & Confirmation */}
      {step === 5 && selectedDate && (
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
          onPrevStep={() => setStep(4)}
          isProcessing={createBookingMutation.isPending}
          fleetName={selectedFleetName}
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

export default EnhancedAutoBookingFormWithFleet;
