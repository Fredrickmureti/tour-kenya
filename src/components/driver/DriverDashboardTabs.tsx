
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, TrendingUp, Car, Navigation, BarChart3 } from 'lucide-react';
import PassengerManifest from './PassengerManifest';
import PerformanceAnalytics from './PerformanceAnalytics';

interface DriverDashboardTabsProps {
  children: React.ReactNode;
}

const DriverDashboardTabs: React.FC<DriverDashboardTabsProps> = ({ children }) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="passengers" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Passengers
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Performance
        </TabsTrigger>
        <TabsTrigger value="routes" className="flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          Navigation
        </TabsTrigger>
      </TabsList>

      {children}

      <TabsContent value="passengers" className="space-y-6">
        <PassengerManifest />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <PerformanceAnalytics />
      </TabsContent>

      <TabsContent value="routes" className="space-y-6">
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <Navigation className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-muted-foreground mb-4">Route navigation coming soon</p>
          <p className="text-sm text-gray-400">GPS integration and turn-by-turn navigation</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DriverDashboardTabs;
