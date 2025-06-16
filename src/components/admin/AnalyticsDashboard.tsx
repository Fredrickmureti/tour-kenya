
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Receipt, Route, RefreshCw } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AnalyticsData {
  total_bookings: number;
  total_revenue: number;
  active_users: number;
  active_routes: number;
}

const AnalyticsDashboard = () => {
  const { getCurrentBranchFilter, isSuperAdmin, currentBranch } = useBranch();
  const { adminUser, refreshSession } = useAdminAuth();

  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-analytics', getCurrentBranchFilter(), adminUser?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!adminUser) {
        throw new Error('No admin user found');
      }

      console.log('Loading analytics for admin:', adminUser.email, 'Role:', adminUser.role);
      
      const branchFilter = getCurrentBranchFilter();
      console.log('Branch filter for analytics:', branchFilter);
      
      try {
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

        // Properly handle the JSON response
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid analytics data received');
        }

        const analyticsData = data as unknown as AnalyticsData;
        
        // Validate the data structure and ensure numbers are properly parsed
        const validatedData: AnalyticsData = {
          total_bookings: Number(analyticsData.total_bookings) || 0,
          total_revenue: Number(analyticsData.total_revenue) || 0,
          active_users: Number(analyticsData.active_users) || 0,
          active_routes: Number(analyticsData.active_routes) || 0
        };

        console.log('Validated analytics data:', validatedData);

        return validatedData;
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

  const handleRetry = async () => {
    try {
      await refreshSession();
      refetch();
    } catch (error) {
      console.error('Error retrying analytics:', error);
    }
  };

  const getBranchDisplayText = () => {
    if (isSuperAdmin && currentBranch === 'all') return 'System-wide';
    if (isSuperAdmin) return 'Branch-specific';
    return 'Branch';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-500">Error loading analytics data</p>
          <p className="text-sm text-gray-500 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button
            onClick={handleRetry}
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Bookings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics?.total_bookings?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Completed and upcoming bookings</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics?.active_users?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Users who have made bookings</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              KES {analytics?.total_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Total earnings from bookings</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics?.active_routes?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Available travel routes</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Dashboard Overview</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {getBranchDisplayText()} analytics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground dark:text-gray-400">
            Use the navigation menu to manage users, routes, bookings, and receipts.
            {isSuperAdmin && ' As a super admin, you can view data across all branches or filter by specific branch.'}
          </p>
          {isSuperAdmin && currentBranch === 'all' && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                ℹ️ Currently viewing aggregated data across all branches. Revenue shown is the total from all branch receipts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
