
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Receipt, Route, TrendingUp, RefreshCw, Car, MapPin } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';

interface AnalyticsData {
  total_bookings: number;
  total_revenue: number;
  active_users: number;
  active_routes: number;
}

interface BookingStat {
  status: string;
  count: number;
}

const AdminOverview = () => {
  const { getCurrentBranchFilter, isSuperAdmin } = useBranch();
  const { adminUser, refreshSession } = useAdminAuth();

  // Function to establish admin session before making queries
  const establishAdminSession = async () => {
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const { error } = await supabase.rpc('establish_admin_session', {
      admin_user_id: adminUser.id
    });

    if (error) {
      throw new Error('Failed to establish admin session');
    }
  };

  // Get analytics data with improved error handling
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useQuery({
    queryKey: ['admin-analytics', getCurrentBranchFilter(), adminUser?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!adminUser) {
        throw new Error('No admin user found');
      }

      console.log('Loading analytics for admin:', adminUser.email, 'Role:', adminUser.role);
      
      const branchFilter = getCurrentBranchFilter();
      console.log('Branch filter:', branchFilter);
      
      try {
        // Establish admin session first
        await establishAdminSession();

        const { data, error } = await supabase
          .rpc('get_admin_analytics', {
            p_branch_id: branchFilter
          });

        if (error) {
          console.error('Error loading analytics:', error);
          
          // Try to refresh session once and retry
          if (error.message?.includes('Access denied') || error.message?.includes('privileges required')) {
            console.log('Attempting to refresh session and retry analytics...');
            const sessionRefreshed = await refreshSession();
            if (sessionRefreshed) {
              // Retry the analytics call
              const { data: retryData, error: retryError } = await supabase
                .rpc('get_admin_analytics', {
                  p_branch_id: branchFilter
                });
              
              if (retryError) {
                throw retryError;
              }
              
              return retryData as unknown as AnalyticsData;
            }
          }
          
          throw error;
        }

        console.log('Analytics data received:', data);
        return data as unknown as AnalyticsData;
      } catch (error: any) {
        console.error('Analytics query error:', error);
        throw error;
      }
    },
    enabled: !!adminUser,
    retry: (failureCount, error: any) => {
      // Only retry for specific errors, max 2 times
      if (failureCount < 2 && error?.message?.includes('Access denied')) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });

  // Get recent bookings with proper session establishment
  const { data: recentBookings, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['admin-recent-bookings', getCurrentBranchFilter(), adminUser?.id],
    queryFn: async () => {
      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      try {
        // Establish admin session first
        await establishAdminSession();

        const branchFilter = getCurrentBranchFilter();
        let query = supabase
          .from('bookings')
          .select(`
            id,
            from_location,
            to_location,
            departure_date,
            departure_time,
            user_id,
            status,
            created_at,
            profiles(full_name),
            manual_bookings(passenger_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (branchFilter) {
          query = query.eq('branch_id', branchFilter);
        }
          
        const { data, error } = await query;
        if (error) {
          console.error('Error loading recent bookings:', error);
          throw error;
        }
        return data || [];
      } catch (error: any) {
        console.error('Recent bookings query error:', error);
        throw error;
      }
    },
    enabled: !!adminUser,
    retry: 2,
    retryDelay: 1000,
  });

  // Get booking statistics with session establishment
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-overview-stats', getCurrentBranchFilter(), adminUser?.id],
    queryFn: async () => {
      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      try {
        // Establish admin session first
        await establishAdminSession();

        const branchFilter = getCurrentBranchFilter();
        
        // Get bookings by status
        let bookingQuery = supabase.from('bookings').select('status');
        if (branchFilter) {
          bookingQuery = bookingQuery.eq('branch_id', branchFilter);
        }
        
        const { data: bookingsData, error: bookingsError } = await bookingQuery;
        
        if (bookingsError) throw bookingsError;
        
        // Count bookings by status
        const counts: Record<string, number> = {};
        bookingsData?.forEach(booking => {
          counts[booking.status] = (counts[booking.status] || 0) + 1;
        });
        
        const bookingsByStatus = Object.entries(counts).map(([status, count]) => ({
          status,
          count
        }));
        
        return {
          bookingsByStatus: bookingsByStatus || []
        };
      } catch (error: any) {
        console.error('Stats query error:', error);
        throw error;
      }
    },
    enabled: !!adminUser,
    retry: 2,
    retryDelay: 1000,
  });

  const handleRetryAnalytics = async () => {
    try {
      await refreshSession();
      refetchAnalytics();
      refetchBookings();
      toast.success('Session refreshed. Retrying data load...');
    } catch (error) {
      console.error('Error retrying analytics:', error);
      toast.error('Failed to refresh session');
    }
  };

  const isLoading = analyticsLoading || bookingsLoading || statsLoading;

  if (analyticsError) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-500">Error loading analytics data</p>
          <p className="text-sm text-gray-500 mt-2">{analyticsError.message}</p>
          <button
            onClick={handleRetryAnalytics}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isSuperAdmin ? 'Superadmin Overview' : 'Admin Overview'}
        </h1>
        <p className="text-muted-foreground">
          {isSuperAdmin ? 'System-wide analytics and performance metrics' : 'Branch analytics and performance metrics'}
        </p>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : analytics?.total_bookings || 0}
            </div>
            <p className="text-xs text-muted-foreground">Completed and upcoming bookings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : analytics?.active_users || 0}
            </div>
            <p className="text-xs text-muted-foreground">Users who have made bookings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {isLoading ? "Loading..." : analytics?.total_revenue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Total earnings from bookings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : analytics?.active_routes || 0}
            </div>
            <p className="text-xs text-muted-foreground">Available travel routes</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="recent-bookings">
        <TabsList>
          <TabsTrigger value="recent-bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="booking-stats">Booking Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent-bookings" className="p-0 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking activity</CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : recentBookings?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent bookings found</p>
                  <button
                    onClick={handleRetryAnalytics}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center mx-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Route</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Passenger</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings?.map((booking: any) => (
                        <tr key={booking.id} className="border-b">
                          <td className="p-2">
                            <div className="font-medium">
                              {booking.from_location} → {booking.to_location}
                            </div>
                          </td>
                          <td className="p-2">
                            <div>
                              {new Date(booking.departure_date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {booking.departure_time}
                            </div>
                          </td>
                          <td className="p-2">
                            {booking.profiles?.full_name || booking.manual_bookings?.[0]?.passenger_name || 'Manual Booking'}
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'upcoming' 
                                ? 'bg-blue-100 text-blue-800' 
                                : booking.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="booking-stats" className="p-0 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Statistics</CardTitle>
              <CardDescription>Overview of booking status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium mb-2">Booking Status Distribution</h4>
                  <div className="space-y-2">
                    {stats?.bookingsByStatus.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">No booking statistics available</p>
                    ) : (
                      stats?.bookingsByStatus.map((item: BookingStat) => (
                        <div key={item.status} className="flex items-center">
                          <div className="w-1/3 capitalize">{item.status}</div>
                          <div className="w-2/3 flex items-center">
                            <div 
                              className="h-2 rounded mr-2"
                              style={{
                                width: `${stats.bookingsByStatus.length ? (item.count / stats.bookingsByStatus.reduce((sum, s) => sum + s.count, 0)) * 100 : 0}%`,
                                backgroundColor: 
                                  item.status === 'upcoming' ? '#3b82f6' :
                                  item.status === 'completed' ? '#10b981' : '#ef4444'
                              }}
                            />
                            <span className="text-sm font-medium">{item.count}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOverview;
