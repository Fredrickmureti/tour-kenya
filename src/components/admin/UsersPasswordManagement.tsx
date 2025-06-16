
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Key, Search, Users } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email?: string;
  created_at: string;
}

const UsersPasswordManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(`Error loading users: ${error.message}`);
        throw error;
      }

      return data as Profile[];
    }
  });

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      toast.error('Please select a user and enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsResetting(true);

    try {
      // Get user email from auth.users table through the admin API
      const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(selectedUser.id);
      
      if (getUserError || !authUser.user?.email) {
        toast.error('Could not find user email');
        return;
      }

      // Update user password
      const { error } = await supabase.auth.admin.updateUserById(
        selectedUser.id,
        { password: newPassword }
      );

      if (error) throw error;

      toast.success(`Password reset successfully for ${selectedUser.full_name || 'user'}`);
      setIsDialogOpen(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(`Error resetting password: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            User Password Management
          </CardTitle>
          <CardDescription>Reset passwords for users who have forgotten them</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold">User ID</TableHead>
                    <TableHead className="font-semibold">Full Name</TableHead>
                    <TableHead className="font-semibold">Joined Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-xs">{user.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <span className="font-medium">{user.full_name || 'N/A'}</span>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                              className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              <Key className="h-3 w-3 mr-1" />
                              Reset Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reset Password</DialogTitle>
                              <DialogDescription>
                                Reset password for {selectedUser?.full_name || 'this user'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                  id="newPassword"
                                  type="password"
                                  placeholder="Enter new password (min 6 characters)"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setIsDialogOpen(false);
                                    setNewPassword('');
                                    setSelectedUser(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleResetPassword}
                                  disabled={isResetting || !newPassword}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {isResetting ? 'Resetting...' : 'Reset Password'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPasswordManagement;
