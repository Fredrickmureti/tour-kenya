
import React from 'react';
import { useDriverAuth } from '@/contexts/DriverAuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LogOut, Car, MapPin, Calendar, Star, Clock, Users, TrendingUp, Route, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverDashboard = () => {
  const { driver, logoutDriver } = useDriverAuth();
  const navigate = useNavigate();

  // Fetch driver's current assignments
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['driver-assignments', driver?.id],
    queryFn: async () => {
      if (!driver) return [];
      
      const { data, error } = await supabase
        .from('driver_assignments')
        .select(`
          *,
          fleet(name, capacity, description),
          routes(from_location, to_location, duration, price)
        `)
        .eq('driver_id', driver.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!driver,
  });

  // Fetch driver's upcoming schedules
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ['driver-schedules', driver?.id],
    queryFn: async () => {
      if (!driver) return [];
      
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          routes(from_location, to_location, duration)
        `)
        .eq('driver_id', driver.id)
        .gte('departure_date', new Date().toISOString().split('T')[0])
        .order('departure_date', { ascending: true })
        .order('departure_time', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching schedules:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!driver,
  });

  const handleLogout = () => {
    logoutDriver();
    toast.success('Logged out successfully');
    navigate('/driver-login-page');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
                <p className="text-gray-600">Welcome back, <span className="font-semibold">{driver.full_name}</span></p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="hover:bg-red-50 hover:border-red-200">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Driver Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <Users className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{driver.total_trips || 0}</div>
              <p className="text-blue-100 text-sm">Completed journeys</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Experience</CardTitle>
              <Clock className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{driver.experience_years || 0}</div>
              <p className="text-emerald-100 text-sm">Years driving</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {driver.rating ? driver.rating.toFixed(1) : 'N/A'}
              </div>
              <p className="text-yellow-100 text-sm">Customer rating</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <div className="h-5 w-5 flex items-center justify-center">
                <Badge className={`${
                  driver.status === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {driver.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-purple-100">License: {driver.license_number}</div>
              <p className="text-purple-100 text-sm">Current status</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Current Assignments */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
              <CardTitle className="flex items-center text-slate-800">
                <Car className="h-6 w-6 mr-3 text-blue-500" />
                Current Assignments
              </CardTitle>
              <CardDescription>Your active bus and route assignments</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {assignmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : assignments && assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment: any) => (
                    <div key={assignment.id} className="border rounded-xl p-5 bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg text-slate-800">{assignment.fleet?.name || 'No Bus Assigned'}</h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                      </div>
                      {assignment.fleet && (
                        <div className="flex items-center mb-3 text-slate-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span className="text-sm">Capacity: {assignment.fleet.capacity} passengers</span>
                        </div>
                      )}
                      {assignment.routes && (
                        <div className="flex items-center text-slate-600">
                          <Route className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm font-medium">
                            {assignment.routes.from_location} → {assignment.routes.to_location}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Car className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg text-gray-500 mb-2">No active assignments</p>
                  <p className="text-sm text-gray-400">Contact admin for bus assignment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Upcoming Schedules */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
              <CardTitle className="flex items-center text-slate-800">
                <Calendar className="h-6 w-6 mr-3 text-emerald-500" />
                Upcoming Schedules
              </CardTitle>
              <CardDescription>Your next scheduled trips</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {schedulesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : schedules && schedules.length > 0 ? (
                <div className="space-y-4">
                  {schedules.map((schedule: any) => (
                    <div key={schedule.id} className="border rounded-xl p-5 bg-gradient-to-r from-white to-emerald-50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-3 text-emerald-500" />
                          <span className="font-semibold text-slate-800">{formatDate(schedule.departure_date)}</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {formatTime(schedule.departure_time)}
                        </Badge>
                      </div>
                      {schedule.routes && (
                        <div className="flex items-center mb-3 text-slate-600">
                          <Navigation className="h-4 w-4 mr-2 text-emerald-500" />
                          <span className="text-sm font-medium">
                            {schedule.routes.from_location} → {schedule.routes.to_location}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-slate-500">
                          <Users className="h-4 w-4 mr-2" />
                          <span className="text-sm">Available seats: {schedule.available_seats}</span>
                        </div>
                        <span className="text-xs text-slate-400">Duration: {schedule.routes?.duration || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg text-gray-500 mb-2">No upcoming schedules</p>
                  <p className="text-sm text-gray-400">Check with admin for new assignments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
