
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { clearBookingState } from '@/utils/bookingStateManager';
import { useFleetManagement } from './useFleetManagement';
import { BookingResponse, BookingFormData } from '../types/bookingTypes';
import { calculateTotalPrice, getTargetBranchId } from '../utils/bookingCalculations';

interface UseBookingMutationProps {
  bookingData: BookingFormData;
  selectedRoute: any;
  branches: any[];
}

export const useBookingMutation = ({ bookingData, selectedRoute, branches }: UseBookingMutationProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { assignBusToBooking } = useFleetManagement();

  return useMutation({
    mutationFn: async (): Promise<BookingResponse> => {
      if (!user || !selectedRoute || !bookingData.selectedDate) {
        throw new Error('Missing required data');
      }

      // Final bus assignment before booking
      const assignment = await assignBusToBooking(
        selectedRoute.id,
        format(bookingData.selectedDate, 'yyyy-MM-dd'),
        bookingData.selectedTime,
        bookingData.selectedBusId,
        bookingData.selectedSeats.length
      );

      if (!assignment) {
        throw new Error('No buses available for booking');
      }

      const targetBranchId = getTargetBranchId(selectedRoute, branches);
      
      if (!targetBranchId) {
        throw new Error('No branch available for booking');
      }

      // Calculate final price with fleet multiplier
      const finalPrice = calculateTotalPrice(
        selectedRoute,
        bookingData.fleetPriceMultiplier,
        bookingData.selectedSeats.length
      );

      const { data, error } = await supabase.rpc('create_booking_with_branch', {
        p_user_id: user.id,
        p_route_id: selectedRoute.id,
        p_from_location: bookingData.fromLocation,
        p_to_location: bookingData.toLocation,
        p_departure_date: format(bookingData.selectedDate, 'yyyy-MM-dd'),
        p_departure_time: bookingData.selectedTime,
        p_arrival_time: '18:00',
        p_seat_numbers: bookingData.selectedSeats.map(seat => seat.toString()),
        p_price: finalPrice,
        p_status: 'upcoming',
        p_branch_id: targetBranchId
      });

      if (error) throw error;

      // Type cast the data to access receipt_id
      const bookingResult = data as any;
      
      // Update the receipt with the correct payment method after booking creation
      if (bookingResult?.receipt_id) {
        const { error: updateError } = await supabase
          .from('receipts')
          .update({ payment_method: bookingData.paymentMethod })
          .eq('id', bookingResult.receipt_id);

        if (updateError) {
          console.warn('Failed to update payment method:', updateError);
        }
      }

      return bookingResult as BookingResponse;
    },
    onSuccess: (data) => {
      toast.success('Booking created successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      clearBookingState();
      
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
};
