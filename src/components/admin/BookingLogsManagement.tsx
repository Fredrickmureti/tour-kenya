
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Trash2, Receipt } from 'lucide-react';

interface Booking {
  id: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  departure_time: string;
  price: number;
  status: string;
  created_at: string;
  user_id: string;
}

const BookingLogsManagement = () => {
  const queryClient = useQueryClient();

  // Fetch recent bookings
  const { data: recentBookings, isLoading } = useQuery({
    queryKey: ['recent-bookings-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user profiles separately
  const { data: userProfiles } = useQuery({
    queryKey: ['user-profiles-for-bookings'],
    queryFn: async () => {
      if (!recentBookings || recentBookings.length === 0) return {};
      
      const userIds = [...new Set(recentBookings.map(booking => booking.user_id))];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
        
      if (error) throw error;
      
      // Convert to object for easy lookup
      const profilesMap: Record<string, { full_name?: string }> = {};
      data?.forEach(profile => {
        profilesMap[profile.id] = { full_name: profile.full_name || undefined };
      });
      
      return profilesMap;
    },
    enabled: !!recentBookings && recentBookings.length > 0
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      // First delete any related receipts
      await supabase
        .from('receipts')
        .delete()
        .eq('booking_id', bookingId);
      
      // Then delete the booking
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Booking deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['recent-bookings-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: (error: any) => {
      toast.error(`Error deleting booking: ${error.message}`);
    }
  });

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      deleteBookingMutation.mutate(bookingId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Recent Booking Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : recentBookings?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent bookings found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings?.map((booking: Booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      {userProfiles?.[booking.user_id]?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {booking.from_location} → {booking.to_location}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.departure_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{booking.departure_time}</TableCell>
                    <TableCell>KSh {booking.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteBooking(booking.id)}
                        disabled={deleteBookingMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingLogsManagement;
