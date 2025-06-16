
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBranch } from '@/contexts/BranchContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface ReceiptData {
  receipt_id: string;
  receipt_number: string;
  booking_id: string;
  passenger_name: string;
  passenger_phone: string;
  route_name: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  generated_at: string;
  branch_name: string;
}

export const useReceiptsManagement = () => {
  const { getCurrentBranchFilter } = useBranch();
  const { adminUser, refreshSession } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: receipts, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-receipts', getCurrentBranchFilter(), adminUser?.id],
    queryFn: async (): Promise<ReceiptData[]> => {
      if (!adminUser) {
        throw new Error('No admin user found');
      }

      const branchFilter = getCurrentBranchFilter();
      
      try {
        const { data, error } = await supabase
          .rpc('get_admin_receipts', {
            p_branch_id: branchFilter
          });
        
        if (error) {
          console.error('Error loading receipts:', error);
          
          // Try to refresh session once and retry
          if (error.message?.includes('Access denied') || error.message?.includes('privileges required')) {
            console.log('Attempting to refresh session and retry receipts...');
            const sessionRefreshed = await refreshSession();
            if (sessionRefreshed) {
              // Retry the receipts call
              const { data: retryData, error: retryError } = await supabase
                .rpc('get_admin_receipts', {
                  p_branch_id: branchFilter
                });
              
              if (retryError) {
                throw retryError;
              }
              
              return retryData || [];
            }
          }
          
          throw error;
        }
        
        return data || [];
      } catch (error: any) {
        console.error('Receipts query error:', error);
        throw error;
      }
    },
    enabled: !!adminUser,
    retry: (failureCount, error: any) => {
      // Only retry for specific errors, max 2 times
      if (failureCount < 2 && (
        error?.message?.includes('Access denied') || 
        error?.message?.includes('structure of query does not match')
      )) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });

  const filteredReceipts = receipts?.filter(receipt => 
    !searchTerm || 
    receipt.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.route_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRetry = async () => {
    try {
      await refreshSession();
      refetch();
    } catch (error) {
      console.error('Error retrying receipts:', error);
    }
  };

  return {
    receipts,
    filteredReceipts,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    handleRetry,
    refetch
  };
};
