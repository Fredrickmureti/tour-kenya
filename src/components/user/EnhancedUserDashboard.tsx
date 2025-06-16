
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, Clock, Receipt, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { EditProfileDialog } from './EditProfileDialog';
import UserRescheduleRequests from './UserRescheduleRequests';

interface UserBooking {
  id: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  departure_time: string;
  seat_numbers: string[];
  price: number;
  status: string;
  created_at: string;
  receipts: {
    id: string;
    receipt_number: string;
    amount: number;
    payment_status: string;
  }[];
}

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  booking_count: number;
  is_online: boolean;
  created_at: string;
}

const EnhancedUserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: userBookings, isLoading: bookingsLoading } = useQuery<UserBooking[]>({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          receipts (
            id,
            receipt_number,
            amount,
            payment_status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserBooking[];
    },
    enabled: !!user?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewReceipt = (receiptId: string) => {
    navigate(`/receipt/${receiptId}`);
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.full_name || 'User'}!</h1>
        <p className="text-muted-foreground">Manage your bookings and travel history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            My Bookings
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Receipts
          </TabsTrigger>
          <TabsTrigger value="reschedules" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reschedules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Information</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{userProfile?.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{userProfile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div className="pt-2">
                    <EditProfileDialog 
                      currentName={userProfile?.full_name || ''}
                      currentPhone={userProfile?.phone || ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Travel Statistics</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold">{userProfile?.booking_count || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Bookings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userBookings?.filter(b => b.status === 'completed').length || 0}</p>
                    <p className="text-xs text-muted-foreground">Completed Trips</p>
                  </div>
                  <div>
                    <Badge variant={userProfile?.is_online ? "default" : "secondary"}>
                      {userProfile?.is_online ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userBookings?.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="text-sm">
                      <p className="font-medium truncate">
                        {booking.from_location} → {booking.to_location}
                      </p>
                      <p className="text-muted-foreground">
                        {new Date(booking.departure_date).toLocaleDateString()}
                      </p>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No recent activity</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                My Bookings
              </CardTitle>
              <CardDescription>
                View and manage all your travel bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : userBookings?.length === 0 ? (
                <div className="text-center py-12 border rounded-md bg-gray-50">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-muted-foreground mb-4">No bookings found</p>
                  <Button onClick={() => navigate('/booking')}>
                    Make Your First Booking
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings?.map((booking) => (
                    <Card key={booking.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {booking.from_location} → {booking.to_location}
                            </span>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-medium">{new Date(booking.departure_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Time</p>
                            <p className="font-medium">{booking.departure_time}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Seats</p>
                            <p className="font-medium">{booking.seat_numbers.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-medium">KSh {booking.price.toLocaleString()}</p>
                          </div>
                        </div>

                        {booking.receipts.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {booking.receipts.map((receipt) => (
                              <Button
                                key={receipt.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewReceipt(receipt.id)}
                              >
                                <Receipt className="h-4 w-4 mr-2" />
                                Receipt #{receipt.receipt_number}
                              </Button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                My Receipts
              </CardTitle>
              <CardDescription>
                View and download your payment receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings?.filter(booking => booking.receipts.length > 0).map((booking) => 
                    booking.receipts.map((receipt) => (
                      <Card key={receipt.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-medium">Receipt #{receipt.receipt_number}</h3>
                              <p className="text-sm text-muted-foreground">
                                {booking.from_location} → {booking.to_location}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.departure_date).toLocaleDateString()} at {booking.departure_time}
                              </p>
                              <Badge variant={receipt.payment_status === 'Paid' ? 'default' : 'secondary'}>
                                {receipt.payment_status}
                              </Badge>
                            </div>
                            <div className="text-right space-y-2">
                              <p className="text-lg font-bold">KSh {receipt.amount.toLocaleString()}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewReceipt(receipt.id)}
                              >
                                <Receipt className="h-4 w-4 mr-2" />
                                View Receipt
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  {userBookings?.filter(booking => booking.receipts.length > 0).length === 0 && (
                    <div className="text-center py-12 border rounded-md bg-gray-50">
                      <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-muted-foreground">No receipts found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reschedules" className="space-y-6">
          <UserRescheduleRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedUserDashboard;
