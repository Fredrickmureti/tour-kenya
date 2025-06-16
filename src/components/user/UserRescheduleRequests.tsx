
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { UserRescheduleRequest } from './reschedule-requests/types';
import { RequestFilters } from './reschedule-requests/RequestFilters';
import { RequestList } from './reschedule-requests/RequestList';

const UserRescheduleRequests = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: rescheduleRequests, isLoading } = useQuery({
    queryKey: ['user-reschedule-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('reschedule_requests')
        .select(`
          *,
          bookings!inner (
            from_location,
            to_location,
            route_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error loading reschedule requests');
        throw error;
      }

      return (data || []) as UserRescheduleRequest[];
    },
    enabled: !!user?.id,
  });

  const filteredRequests = rescheduleRequests?.filter(request => {
    const matchesSearch = !searchTerm || 
      request.bookings.from_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.bookings.to_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  const handlePay = (requestId: string) => {
    toast.info('Payment functionality will be implemented in a future step.');
    console.log('Redirecting to payment for request:', requestId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            My Reschedule Requests
          </CardTitle>
          <CardDescription>
            View and track your journey reschedule requests and their approval status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RequestFilters
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <RequestList
              requests={filteredRequests}
              statusFilter={statusFilter}
              onPay={handlePay}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRescheduleRequests;
