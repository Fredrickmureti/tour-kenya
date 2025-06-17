
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, DollarSign, Navigation, Users } from 'lucide-react';
import RevenueAnalytics from './RevenueAnalytics';
import FleetTracking from './FleetTracking';

interface AdminDashboardTabsProps {
  children: React.ReactNode;
}

const AdminDashboardTabs: React.FC<AdminDashboardTabsProps> = ({ children }) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="revenue" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Revenue
        </TabsTrigger>
        <TabsTrigger value="fleet" className="flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          Fleet Tracking
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          User Analytics
        </TabsTrigger>
      </TabsList>

      {children}

      <TabsContent value="revenue" className="space-y-6">
        <RevenueAnalytics />
      </TabsContent>

      <TabsContent value="fleet" className="space-y-6">
        <FleetTracking />
      </TabsContent>

      <TabsContent value="users" className="space-y-6">
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-muted-foreground mb-4">User analytics coming soon</p>
          <p className="text-sm text-gray-400">User behavior, demographics, and engagement metrics</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboardTabs;
