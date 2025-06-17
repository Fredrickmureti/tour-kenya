
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Calendar, Download, Filter, Users, Route } from 'lucide-react';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  averageBookingValue: number;
  revenueGrowth: number;
  topRoutes: Array<{ route: string; revenue: number; bookings: number }>;
  monthlyTrends: Array<{ month: string; revenue: number; bookings: number }>;
  paymentMethods: Array<{ method: string; amount: number; percentage: number }>;
}

const RevenueAnalytics: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-analytics', timeFilter],
    queryFn: async (): Promise<RevenueData> => {
      // Calculate date range based on filter
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeFilter) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Get booking data for the selected period
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (bookingsError) throw bookingsError;

      // Get receipt data
      const { data: receipts, error: receiptsError } = await supabase
        .from('receipts')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (receiptsError) throw receiptsError;

      // Calculate metrics
      const totalRevenue = receipts?.reduce((sum, receipt) => sum + Number(receipt.amount), 0) || 0;
      const totalBookings = bookings?.length || 0;
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(endDate.getDate() - 30);
      const monthlyRevenue = receipts?.filter(r => new Date(r.created_at) >= thirtyDaysAgo)
        .reduce((sum, receipt) => sum + Number(receipt.amount), 0) || 0;

      // Calculate daily revenue (today)
      const today = new Date().toISOString().split('T')[0];
      const dailyRevenue = receipts?.filter(r => r.created_at.startsWith(today))
        .reduce((sum, receipt) => sum + Number(receipt.amount), 0) || 0;

      // Top routes by revenue
      const routeRevenue = bookings?.reduce((acc: any, booking) => {
        const route = `${booking.from_location} → ${booking.to_location}`;
        if (!acc[route]) {
          acc[route] = { revenue: 0, bookings: 0 };
        }
        acc[route].revenue += Number(booking.price);
        acc[route].bookings += 1;
        return acc;
      }, {});

      const topRoutes = Object.entries(routeRevenue || {})
        .map(([route, data]: [string, any]) => ({ route, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Monthly trends (last 6 months)
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        const monthBookings = bookings?.filter(b => {
          const bookingDate = new Date(b.created_at);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        }) || [];

        const monthReceipts = receipts?.filter(r => {
          const receiptDate = new Date(r.created_at);
          return receiptDate >= monthStart && receiptDate <= monthEnd;
        }) || [];

        monthlyTrends.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthReceipts.reduce((sum, receipt) => sum + Number(receipt.amount), 0),
          bookings: monthBookings.length
        });
      }

      // Payment methods breakdown
      const paymentMethods = receipts?.reduce((acc: any, receipt) => {
        const method = receipt.payment_method || 'Unknown';
        if (!acc[method]) {
          acc[method] = 0;
        }
        acc[method] += Number(receipt.amount);
        return acc;
      }, {});

      const paymentMethodsArray = Object.entries(paymentMethods || {})
        .map(([method, amount]: [string, any]) => ({
          method,
          amount,
          percentage: (amount / totalRevenue) * 100
        }));

      return {
        totalRevenue,
        monthlyRevenue,
        dailyRevenue,
        averageBookingValue,
        revenueGrowth: 12.5, // Mock growth percentage
        topRoutes,
        monthlyTrends,
        paymentMethods: paymentMethodsArray
      };
    },
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
          <p className="text-gray-600">Track financial performance and revenue trends</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {revenueData?.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{revenueData?.revenueGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {revenueData?.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {revenueData?.dailyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Today's earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {revenueData?.averageBookingValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
          <TabsTrigger value="routes">Top Routes</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Booking Trends</CardTitle>
              <CardDescription>Monthly revenue and booking volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData?.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'revenue' ? `KSh ${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Bookings'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="bookings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Route className="h-5 w-5 mr-2" />
                Top Revenue Routes
              </CardTitle>
              <CardDescription>Highest earning routes by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData?.topRoutes.map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-sm">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{route.route}</p>
                        <p className="text-sm text-muted-foreground">
                          {route.bookings} bookings
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">KSh {route.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Avg: KSh {(route.revenue / route.bookings).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Distribution</CardTitle>
                <CardDescription>Revenue breakdown by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueData?.paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.method} (${entry.percentage.toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {revenueData?.paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`KSh ${value.toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Details</CardTitle>
                <CardDescription>Detailed breakdown of payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData?.paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">KSh {method.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueAnalytics;
