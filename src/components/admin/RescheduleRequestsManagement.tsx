
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { RescheduleRequest } from './reschedule-requests/types';
import { RequestList } from './reschedule-requests/RequestList';
import { RequestDetails } from './reschedule-requests/RequestDetails';
import { RequestError } from './reschedule-requests/RequestError';

export const RescheduleRequestsManagement: React.FC = () => {
  const { adminUser, refreshSession } = useAdminAuth();
  const [requests, setRequests] = useState<RescheduleRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [feeAmount, setFeeAmount] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (adminUser) {
      fetchRequests();
    }
  }, [adminUser]);

  const fetchRequests = async () => {
    if (!adminUser) {
      setError('Admin user not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Establish admin session first
      const { error: sessionError } = await supabase.rpc('establish_admin_session', {
        admin_user_id: adminUser.id
      });

      if (sessionError) {
        console.error('Session establishment error:', sessionError);
        throw new Error('Failed to establish admin session');
      }

      const { data, error } = await supabase
        .from('reschedule_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reschedule requests:', error);
        throw error;
      }
      
      setRequests(data as RescheduleRequest[] || []);
    } catch (error: any) {
      console.error('Error in fetchRequests:', error);
      setError(error.message || 'Failed to load reschedule requests');
      
      // Try to refresh session once and retry
      if (error.message?.includes('Access denied') || error.message?.includes('privileges required')) {
        console.log('Attempting to refresh session and retry...');
        const sessionRefreshed = await refreshSession();
        if (sessionRefreshed) {
          // Retry once more
          try {
            const { data: retryData, error: retryError } = await supabase
              .from('reschedule_requests')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (retryError) {
              throw retryError;
            }
            
            setRequests(retryData as RescheduleRequest[] || []);
            setError(null);
          } catch (retryErr: any) {
            setError(retryErr.message || 'Failed to load reschedule requests after retry');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const processRequest = async (status: 'approved' | 'rejected') => {
    if (!adminUser || !selectedRequest) return;

    setProcessing(true);
    try {
      let paymentStatus: RescheduleRequest['payment_status'] = 'not_applicable';
      if (status === 'approved' && feeAmount > 0) {
        paymentStatus = 'awaiting_payment';
      } else if (status === 'approved' && feeAmount === 0) {
        paymentStatus = 'not_applicable'
      }

      const { error } = await supabase
        .from('reschedule_requests')
        .update({
          status,
          admin_notes: adminNotes,
          fee_amount: status === 'approved' ? feeAmount : 0,
          processed_by: adminUser.id,
          processed_at: new Date().toISOString(),
          payment_status: paymentStatus
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success(`Request ${status} successfully`);
      fetchRequests();
      setSelectedRequest(null);
      setAdminNotes('');
      setFeeAmount(0);
    } catch (error: any) {
      console.error('Error processing request:', error);
      toast.error(`Failed to process request: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = async () => {
    try {
      await refreshSession();
      fetchRequests();
    } catch (error) {
      console.error('Error retrying fetch:', error);
    }
  };

  const getStatusColor = (status: string, paymentStatus?: string) => {
    if (status === 'approved') {
      if (paymentStatus === 'awaiting_payment') return 'bg-blue-100 text-blue-800';
      if (paymentStatus === 'paid') return 'bg-purple-100 text-purple-800';
    }
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestStatusText = (status: string, paymentStatus?: string) => {
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    if (status === 'approved') {
        if (paymentStatus === 'awaiting_payment') return 'Awaiting Payment';
        if (paymentStatus === 'paid') return 'Paid';
        return 'Approved (No Fee)';
    }
    return capitalizedStatus;
  };
  
  const handleSelectRequest = (request: RescheduleRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setFeeAmount(request.fee_amount || 0);
  };

  if (!adminUser) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Admin access required</p>
      </div>
    );
  }

  if (error && !loading) {
    return <RequestError error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reschedule Requests</h2>
        <p className="text-muted-foreground">Manage customer booking reschedule requests</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RequestList
            requests={requests}
            selectedRequest={selectedRequest}
            onSelectRequest={handleSelectRequest}
            getStatusColor={getStatusColor}
            getRequestStatusText={getRequestStatusText}
          />

          {selectedRequest && (
            <RequestDetails
              selectedRequest={selectedRequest}
              adminNotes={adminNotes}
              setAdminNotes={setAdminNotes}
              feeAmount={feeAmount}
              setFeeAmount={setFeeAmount}
              processing={processing}
              onProcessRequest={processRequest}
              getStatusColor={getStatusColor}
              getRequestStatusText={getRequestStatusText}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default RescheduleRequestsManagement;
