
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDriverAuth } from '@/contexts/DriverAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Star, Calendar, Clock, Trophy, Target } from 'lucide-react';

interface PerformanceMetrics {
  totalTrips: number;
  monthlyTrips: number;
  averageRating: number;
  onTimePerformance: number;
  totalRevenue: number;
  monthlyRevenue: number;
  completionRate: number;
  customerSatisfaction: number;
}

const PerformanceAnalytics: React.FC = () => {
  const { driver } = useDriverAuth();

  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['driver-performance', driver?.id],
    queryFn: async (): Promise<PerformanceMetrics> => {
      if (!driver?.id) {
        return {
          totalTrips: 0,
          monthlyTrips: 0,
          averageRating: 0,
          onTimePerformance: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          completionRate: 0,
          customerSatisfaction: 0
        };
      }

      // Get basic driver stats
      const driverStats = {
        totalTrips: driver.total_trips || 0,
        averageRating: driver.rating || 0
      };

      // Calculate monthly trips (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: monthlySchedules } = await supabase
        .from('schedules')
        .select('id')
        .eq('driver_id', driver.id)
        .gte('departure_date', thirtyDaysAgo.toISOString().split('T')[0]);

      // Mock data for demonstration - in real app, this would come from actual metrics
      const monthlyTrips = monthlySchedules?.length || 0;
      const onTimePerformance = 92; // 92%
      const totalRevenue = driverStats.totalTrips * 2500; // Estimated revenue
      const monthlyRevenue = monthlyTrips * 2500;
      const completionRate = 98; // 98%
      const customerSatisfaction = (driverStats.averageRating / 5) * 100;

      return {
        totalTrips: driverStats.totalTrips,
        monthlyTrips,
        averageRating: driverStats.averageRating,
        onTimePerformance,
        totalRevenue,
        monthlyRevenue,
        completionRate,
        customerSatisfaction
      };
    },
    enabled: !!driver?.id,
  });

  const { data: monthlyTrends } = useQuery({
    queryKey: ['driver-monthly-trends', driver?.id],
    queryFn: async () => {
      // Mock monthly trend data - in real app, this would be calculated from actual data
      return [
        { month: 'Jan', trips: 45, rating: 4.2, revenue: 112500 },
        { month: 'Feb', trips: 52, rating: 4.4, revenue: 130000 },
        { month: 'Mar', trips: 48, rating: 4.3, revenue: 120000 },
        { month: 'Apr', trips: 55, rating: 4.5, revenue: 137500 },
        { month: 'May', trips: 60, rating: 4.6, revenue: 150000 },
        { month: 'Jun', trips: 58, rating: 4.7, revenue: 145000 },
      ];
    },
    enabled: !!driver?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 95) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 85) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 75) return { level: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center text-slate-800">
            <TrendingUp className="h-6 w-6 mr-3 text-blue-500" />
            Performance Analytics
          </CardTitle>
          <CardDescription>
            Your performance metrics and achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{performanceData?.totalTrips}</div>
              <div className="text-sm text-gray-600">Total Trips</div>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {performanceData?.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{performanceData?.onTimePerformance}%</div>
              <div className="text-sm text-gray-600">On-Time Performance</div>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{performanceData?.completionRate}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Performance Indicators</h4>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-sm text-gray-600">
                    {performanceData?.customerSatisfaction.toFixed(0)}%
                  </span>
                </div>
                <Progress value={performanceData?.customerSatisfaction} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">On-Time Performance</span>
                  <span className="text-sm text-gray-600">{performanceData?.onTimePerformance}%</span>
                </div>
                <Progress value={performanceData?.onTimePerformance} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Trip Completion Rate</span>
                  <span className="text-sm text-gray-600">{performanceData?.completionRate}%</span>
                </div>
                <Progress value={performanceData?.completionRate} className="h-2" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Performance Level</h4>
              <div className="space-y-3">
                {[
                  { metric: 'Overall Performance', score: Math.round((performanceData?.onTimePerformance || 0 + performanceData?.completionRate || 0 + performanceData?.customerSatisfaction || 0) / 3) },
                  { metric: 'Customer Service', score: performanceData?.customerSatisfaction || 0 },
                  { metric: 'Reliability', score: performanceData?.onTimePerformance || 0 }
                ].map((item, index) => {
                  const perf = getPerformanceLevel(item.score);
                  return (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.metric}</span>
                      <Badge className={`${perf.bgColor} ${perf.color}`}>
                        {perf.level}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Monthly Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="trips" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Trips"
                />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Rating"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`KSh ${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;
