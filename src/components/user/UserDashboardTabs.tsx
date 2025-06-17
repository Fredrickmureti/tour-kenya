
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Calendar, Receipt, Clock, Heart, Settings } from 'lucide-react';
import TravelPreferences from './TravelPreferences';
import FavoriteRoutes from './FavoriteRoutes';

interface UserDashboardTabsProps {
  children: React.ReactNode;
}

const UserDashboardTabs: React.FC<UserDashboardTabsProps> = ({ children }) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
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
        <TabsTrigger value="favorites" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Favorites
        </TabsTrigger>
        <TabsTrigger value="preferences" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Preferences
        </TabsTrigger>
      </TabsList>

      {children}

      <TabsContent value="favorites" className="space-y-6">
        <FavoriteRoutes />
      </TabsContent>

      <TabsContent value="preferences" className="space-y-6">
        <TravelPreferences />
      </TabsContent>
    </Tabs>
  );
};

export default UserDashboardTabs;
