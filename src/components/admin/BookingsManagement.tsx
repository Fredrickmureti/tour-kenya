
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, MapPin, Users, RefreshCw, Trash2, Bus } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { BookingDeleteDialog } from './BookingDeleteDialog';

interface BookingData {
  booking_id: string;
  user_id: string;
  route_name: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  departure_date: string;
  departure_time: string;
  seat_numbers: string[];
  price: number;
  status: string;
  created_at: string;
  branch_name: string;
  booking_type: string;
  fleet_name?: string;
  bus_id?: string;
}

const BookingsManagement = () => {
  const { getCurrentBranchFilter, isSuperAdmin, currentBranch } = useBranch();
  const { adminUser, refreshSession } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-bookings-with-fleet', getCurrentBranchFilter(), adminUser?.id],
    queryFn: async (): Promise<BookingData[]> => {
      if (!adminUser) {
        throw new Error('No admin user found');
      }

      const branchFilter = getCurrentBranchFilter();
      
      try {
        // Get bookings with fleet information
        const { data, error } = await supabase
          .rpc('get_admin_bookings', {
            p_branch_id: branchFilter
          });
        
        if (error) {
          console.error('Error loading bookings:', error);
          
          if (error.message?.includes('Access denied') || error.message?.includes('privileges required') || error.message?.includes('structure of query does not match')) {
            console.log('Attempting to refresh session and retry bookings...');
            const sessionRefreshed = await refreshSession();
            if (sessionRefreshed) {
              const { data: retryData, error: retryError } = await supabase
                .rpc('get_admin_bookings', {
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
        
        // Enhance bookings with fleet information
        const enhancedBookings = await Promise.all(
          (data || []).map(async (booking: any) => {
            // Try to get fleet info from seat availability
            const { data: seatInfo } = await supabase
              .from('seat_availability')
              .select(`
                bus_id,
                fleet:bus_id (
                  name
                )
              `)
              .eq('booking_id', booking.booking_id)
              .limit(1)
              .single();

            return {
              ...booking,
              fleet_name: seatInfo?.fleet?.name || 'N/A',
              bus_id: seatInfo?.bus_id || null
            };
          })
        );
        
        return enhancedBookings;
      } catch (error: any) {
        console.error('Bookings query error:', error);
        throw error;
      }
    },
    enabled: !!adminUser,
    retry: (failureCount, error: any) => {
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

  const filteredBookings = bookings?.filter(booking => 
    !searchTerm || 
    booking.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.passenger_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getBranchDisplayName = () => {
    if (currentBranch === 'all') return 'All Branches';
    if (currentBranch && typeof currentBranch === 'object') return currentBranch.name;
    return 'Unknown Branch';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRetry = async () => {
    try {
      await refreshSession();
      refetch();
    } catch (error) {
      console.error('Error retrying bookings:', error);
    }
  };

  const totalBookings = bookings?.length || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed')?.length || 0;
  const upcomingBookings = bookings?.filter(b => b.status === 'upcoming')?.length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Bookings Management
              </CardTitle>
              <CardDescription>
                View and manage bookings for {getBranchDisplayName()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-900">{totalBookings}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-600">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{completedBookings}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-600">Upcoming</p>
                  <p className="text-2xl font-bold text-orange-900">{upcomingBookings}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 border rounded-md bg-red-50">
              <Calendar className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium">Error loading bookings</p>
              <p className="text-sm text-gray-500 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
              <button
                onClick={handleRetry}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-gray-50">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings found.</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Details</TableHead>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Travel Date</TableHead>
                    <TableHead>Fleet Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    {isSuperAdmin && <TableHead>Branch</TableHead>}
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.booking_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">#{booking.booking_id.slice(0, 8)}</div>
                          <div className="text-xs text-muted-foreground">
                            Seats: {booking.seat_numbers?.join(', ') || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.passenger_name}</div>
                          <div className="text-xs text-muted-foreground">{booking.passenger_email}</div>
                          <div className="text-xs text-muted-foreground">{booking.passenger_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.route_name}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{new Date(booking.departure_date).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{booking.departure_time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Bus className="h-3 w-3 text-purple-600" />
                          <span className="text-sm font-medium">{booking.fleet_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">KES {booking.price?.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>{booking.branch_name}</TableCell>
                      )}
                      <TableCell>
                        <Badge variant={booking.booking_type === 'Manual' ? 'secondary' : 'default'}>
                          {booking.booking_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <BookingDeleteDialog
                          bookingId={booking.booking_id}
                          bookingDetails={`${booking.passenger_name} - ${booking.route_name} on ${new Date(booking.departure_date).toLocaleDateString()}`}
                          onSuccess={refetch}
                        >
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </BookingDeleteDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsManagement;
