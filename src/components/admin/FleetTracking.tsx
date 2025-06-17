
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { MapPin, Navigation, Clock, Fuel, AlertTriangle, CheckCircle, Users, Route } from 'lucide-react';

interface FleetVehicle {
  id: string;
  name: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'offline';
  currentRoute?: string;
  location?: string;
  driver?: string;
  passengers: number;
  fuelLevel: number;
  lastUpdate: string;
  nextMaintenance: string;
}

const FleetTracking: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: fleetVehicles, isLoading } = useQuery({
    queryKey: ['fleet-tracking', statusFilter],
    queryFn: async (): Promise<FleetVehicle[]> => {
      // Get fleet data
      const { data: fleet, error: fleetError } = await supabase
        .from('fleet')
        .select('*');

      if (fleetError) throw fleetError;

      // Get current assignments and schedules
      const { data: schedules } = await supabase
        .from('schedules')
        .select(`
          *,
          routes (from_location, to_location),
          drivers (full_name)
        `)
        .eq('departure_date', new Date().toISOString().split('T')[0]);

      // Transform data into fleet tracking format
      const vehicles: FleetVehicle[] = fleet?.map(bus => {
        const currentSchedule = schedules?.find(s => s.bus_id === bus.id);
        
        // Mock real-time data - in production, this would come from GPS/IoT devices
        return {
          id: bus.id,
          name: bus.name,
          capacity: bus.capacity,
          status: Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'maintenance' : 'offline',
          currentRoute: currentSchedule ? 
            `${currentSchedule.routes?.from_location} → ${currentSchedule.routes?.to_location}` : 
            undefined,
          location: currentSchedule ? 
            `En route to ${currentSchedule.routes?.to_location}` : 
            'Depot',
          driver: currentSchedule?.drivers?.full_name,
          passengers: Math.floor(Math.random() * bus.capacity),
          fuelLevel: Math.floor(Math.random() * 100),
          lastUpdate: new Date(Date.now() - Math.random() * 300000).toISOString(), // Last 5 minutes
          nextMaintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Next 30 days
        };
      }) || [];

      // Apply status filter
      if (statusFilter !== 'all') {
        return vehicles.filter(v => v.status === statusFilter);
      }

      return vehicles;
    },
  });

  const filteredVehicles = fleetVehicles?.filter(vehicle =>
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.currentRoute?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4" />;
      case 'offline':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level > 50) return 'bg-green-500';
    if (level > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Statistics
  const activeVehicles = fleetVehicles?.filter(v => v.status === 'active').length || 0;
  const maintenanceVehicles = fleetVehicles?.filter(v => v.status === 'maintenance').length || 0;
  const offlineVehicles = fleetVehicles?.filter(v => v.status === 'offline').length || 0;
  const totalPassengers = fleetVehicles?.reduce((sum, v) => sum + v.passengers, 0) || 0;
  const averageOccupancy = fleetVehicles?.length ? 
    (totalPassengers / fleetVehicles.reduce((sum, v) => sum + v.capacity, 0)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fleet Tracking</h2>
          <p className="text-gray-600">Real-time monitoring of your fleet vehicles</p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeVehicles}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{maintenanceVehicles}</div>
            <p className="text-xs text-muted-foreground">Under maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Passengers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPassengers}</div>
            <p className="text-xs text-muted-foreground">Currently onboard</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Occupancy</CardTitle>
            <Navigation className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{averageOccupancy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Fleet utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Vehicles List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="h-5 w-5 mr-2" />
            Fleet Status
          </CardTitle>
          <CardDescription>
            Live tracking and status of all vehicles ({filteredVehicles?.length} vehicles)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVehicles?.map((vehicle) => (
              <Card key={vehicle.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Navigation className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Capacity: {vehicle.capacity} passengers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(vehicle.status)}>
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-1 capitalize">{vehicle.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        Location
                      </div>
                      <p className="font-medium">{vehicle.location}</p>
                    </div>

                    {vehicle.currentRoute && (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Route className="h-4 w-4 mr-2" />
                          Current Route
                        </div>
                        <p className="font-medium">{vehicle.currentRoute}</p>
                      </div>
                    )}

                    {vehicle.driver && (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-2" />
                          Driver
                        </div>
                        <p className="font-medium">{vehicle.driver}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Last Update
                      </div>
                      <p className="font-medium">
                        {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Passengers</span>
                        <span className="text-sm text-muted-foreground">
                          {vehicle.passengers}/{vehicle.capacity}
                        </span>
                      </div>
                      <Progress 
                        value={(vehicle.passengers / vehicle.capacity) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Fuel Level</span>
                        <span className="text-sm text-muted-foreground">{vehicle.fuelLevel}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getFuelLevelColor(vehicle.fuelLevel)}`}
                          style={{ width: `${vehicle.fuelLevel}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Next Maintenance</span>
                      <p className="text-sm text-muted-foreground">
                        {new Date(vehicle.nextMaintenance).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4 space-x-2">
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      Track
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-1" />
                      Contact Driver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FleetTracking;
