
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Users, UserCheck, Calendar, MapPin, RefreshCw, Trash2 } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';

interface UserWithContact {
  user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  booking_count: number;
  is_online: boolean;
  created_at: string;
}

const UsersManagement = () => {
  const { currentBranch, isSuperAdmin } = useBranch();
  const { adminUser, refreshSession } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const getCurrentBranchName = () => {
    if (currentBranch && typeof currentBranch === 'object') {
      return currentBranch.name;
    }
    return '';
  };

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete user profile (RLS will handle permissions)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        throw new Error(`Failed to delete user profile: ${profileError.message}`);
      }

      // Note: In production, you might want to also delete the auth user
      // This requires service role key and should be done via edge function
      return { success: true };
    },
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-contact'] });
    },
    onError: (error: any) => {
      toast.error(`Error deleting user: ${error.message}`);
    }
  });

  // Fetch users with complete contact information
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users-with-contact', adminUser?.id],
    queryFn: async (): Promise<UserWithContact[]> => {
      if (!adminUser) {
        throw new Error('No admin user found');
      }

      console.log('Loading users for admin:', adminUser.email, 'Role:', adminUser.role);
      
      try {
        const { data, error } = await supabase
          .rpc('get_admin_users_with_contact');
        
        if (error) {
          console.error('Error fetching users:', error);
          
          // Try to refresh session once and retry
          if (error.message?.includes('Access denied') || error.message?.includes('privileges required')) {
            console.log('Attempting to refresh session and retry users...');
            const sessionRefreshed = await refreshSession();
            if (sessionRefreshed) {
              // Retry the users call
              const { data: retryData, error: retryError } = await supabase
                .rpc('get_admin_users_with_contact');
              
              if (retryError) {
                throw retryError;
              }
              
              return retryData || [];
            }
          }
          
          throw error;
        }

        return data || [];
      } catch (error: any) {
        console.error('Error in users query:', error);
        throw error;
      }
    },
    enabled: !!adminUser,
    retry: (failureCount, error: any) => {
      // Retry up to 2 times for session-related errors
      if (failureCount < 2 && error?.message?.includes('Access denied')) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });

  // Filter users based on search term
  const filteredUsers = users?.filter((user: UserWithContact) =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  ) || [];

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((user: UserWithContact) => user.is_online)?.length || 0;
  const totalBookings = users?.reduce((sum: number, user: UserWithContact) => sum + user.booking_count, 0) || 0;

  // Handle retry for failed queries
  const handleRetry = async () => {
    try {
      console.log('Manual retry initiated');
      await refreshSession();
      refetch();
    } catch (error) {
      console.error('Error retrying users fetch:', error);
    }
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getCurrentBranchName() ? `Managing users for ${getCurrentBranchName()}` : 'Managing all users'}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Users</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error.message || 'An error occurred while loading users.'}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getCurrentBranchName() ? `Managing users for ${getCurrentBranchName()}` : 'Managing all users'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Now</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Bookings</CardTitle>
            <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalUsers > 0 ? (totalBookings / totalUsers).toFixed(1) : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No users found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms.' : 'No users have registered yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: UserWithContact) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {user.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {user.user_id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {user.email || 'No email'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.phone || 'No phone'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.is_online ? "default" : "secondary"}
                      className={user.is_online ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {user.is_online ? 'Online' : 'Offline'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{user.booking_count}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete user "{user.full_name || user.email}"? 
                            This will remove their profile and booking history. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteUserMutation.isPending}
                          >
                            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default UsersManagement;
