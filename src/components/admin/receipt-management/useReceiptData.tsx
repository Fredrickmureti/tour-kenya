
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { EnhancedReceipt } from './types';

export const useReceiptData = () => {
  const { adminUser, refreshSession } = useAdminAuth();

  return useQuery({
    queryKey: ['admin-receipts-enhanced', adminUser?.id],
    queryFn: async () => {
      console.log('Fetching receipts with sign-off data...');
      
      if (!adminUser) {
        throw new Error('No admin user found');
      }

      try {
        // Try the database function first
        const { data: functionData, error: functionError } = await supabase.rpc('get_admin_receipts_with_signoff');

        if (functionError) {
          console.warn('Database function failed, falling back to direct query:', functionError);
          
          // Fallback to direct query
          const { data: receiptsData, error: receiptsError } = await supabase
            .from('receipts')
            .select(`
              id,
              receipt_number,
              booking_id,
              amount,
              payment_method,
              payment_status,
              generated_at,
              receipt_status,
              bookings!inner (
                id,
                from_location,
                to_location,
                user_id,
                branch_id,
                branches (
                  name
                ),
                manual_bookings (
                  passenger_name,
                  passenger_phone
                )
              ),
              profiles (
                full_name,
                phone
              )
            `)
            .order('generated_at', { ascending: false });

          if (receiptsError) {
            console.error('Direct query also failed:', receiptsError);
            throw receiptsError;
          }

          // Transform direct query data to match our interface
          const transformedData: EnhancedReceipt[] = (receiptsData || []).map((receipt: any) => {
            const booking = receipt.bookings;
            const manualBooking = booking?.manual_bookings?.[0];
            const profile = receipt.profiles;

            return {
              receipt_id: receipt.id,
              receipt_number: receipt.receipt_number,
              booking_id: receipt.booking_id,
              passenger_name: profile?.full_name || manualBooking?.passenger_name || 'N/A',
              passenger_phone: profile?.phone || manualBooking?.passenger_phone || 'N/A',
              route_name: booking ? `${booking.from_location} → ${booking.to_location}` : 'N/A',
              amount: receipt.amount,
              payment_method: receipt.payment_method,
              payment_status: receipt.payment_status,
              generated_at: receipt.generated_at,
              branch_name: booking?.branches?.name || 'Main Branch',
              receipt_status: receipt.receipt_status || 'pending',
              is_signed_off: false, // We'll check this separately
              verification_count: 0,
            };
          });

          // Check sign-off status for each receipt
          for (const receipt of transformedData) {
            const { data: verificationData } = await supabase
              .from('receipt_verifications')
              .select('*')
              .eq('receipt_id', receipt.receipt_id)
              .eq('verification_type', 'signed_off');

            receipt.is_signed_off = (verificationData?.length || 0) > 0;
            receipt.verification_count = verificationData?.length || 0;
          }

          console.log('Fallback query successful, transformed receipts:', transformedData);
          return transformedData;
        }

        // If function succeeded, transform its data
        const transformedData: EnhancedReceipt[] = (functionData || []).map((receipt: any) => ({
          receipt_id: receipt.receipt_id,
          receipt_number: receipt.receipt_number,
          booking_id: receipt.booking_id,
          passenger_name: receipt.passenger_name,
          passenger_phone: receipt.passenger_phone,
          route_name: receipt.route_name,
          amount: receipt.amount,
          payment_method: receipt.payment_method,
          payment_status: receipt.payment_status,
          generated_at: receipt.generated_at,
          branch_name: receipt.branch_name,
          receipt_status: receipt.receipt_status,
          is_signed_off: receipt.is_signed_off,
          verification_count: receipt.verification_count,
        }));

        console.log('Function query successful, transformed receipts:', transformedData);
        return transformedData;

      } catch (error: any) {
        console.error('Error in receipt query:', error);
        
        // Try to refresh session and retry once
        if (error.message?.includes('Access denied') || error.message?.includes('privileges required')) {
          console.log('Attempting to refresh session and retry...');
          const sessionRefreshed = await refreshSession();
          if (sessionRefreshed) {
            // Retry with refreshed session - simplified approach
            const { data: retryData, error: retryError } = await supabase
              .from('receipts')
              .select(`
                id,
                receipt_number,
                booking_id,
                amount,
                payment_method,
                payment_status,
                generated_at,
                receipt_status
              `)
              .order('generated_at', { ascending: false })
              .limit(50);

            if (retryError) {
              throw retryError;
            }

            // Basic transformation for retry
            const basicData: EnhancedReceipt[] = (retryData || []).map((receipt: any) => ({
              receipt_id: receipt.id,
              receipt_number: receipt.receipt_number,
              booking_id: receipt.booking_id,
              passenger_name: 'N/A',
              passenger_phone: 'N/A',
              route_name: 'N/A',
              amount: receipt.amount,
              payment_method: receipt.payment_method,
              payment_status: receipt.payment_status,
              generated_at: receipt.generated_at,
              branch_name: 'Main Branch',
              receipt_status: receipt.receipt_status || 'pending',
              is_signed_off: false,
              verification_count: 0,
            }));

            return basicData;
          }
        }
        
        throw error;
      }
    },
    enabled: !!adminUser,
    retry: (failureCount, error: any) => {
      if (failureCount < 2) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });
};
