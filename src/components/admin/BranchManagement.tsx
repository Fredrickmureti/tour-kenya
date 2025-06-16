
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapPin, Edit, Plus, Building2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { Badge } from '@/components/ui/badge';

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BranchFormData {
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

const BranchEditDialog: React.FC<{
  branch?: Branch;
  isOpen: boolean;
  onClose: () => void;
}> = ({ branch, isOpen, onClose }) => {
  const [formData, setFormData] = useState<BranchFormData>({
    name: branch?.name || '',
    code: branch?.code || '',
    address: branch?.address || '',
    city: branch?.city || '',
    phone: branch?.phone || '',
    email: branch?.email || ''
  });
  const queryClient = useQueryClient();

  const saveBranchMutation = useMutation({
    mutationFn: async (data: BranchFormData) => {
      if (branch) {
        // Update existing branch
        const { error } = await supabase
          .from('branches')
          .update({
            name: data.name,
            code: data.code,
            address: data.address,
            city: data.city,
            phone: data.phone || null,
            email: data.email || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', branch.id);
        
        if (error) throw error;
      } else {
        // Create new branch
        const { error } = await supabase
          .from('branches')
          .insert({
            name: data.name,
            code: data.code,
            address: data.address,
            city: data.city,
            phone: data.phone || null,
            email: data.email || null,
            is_active: true
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(branch ? 'Branch updated successfully!' : 'Branch created successfully!');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Error ${branch ? 'updating' : 'creating'} branch: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.address.trim() || !formData.city.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    saveBranchMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof BranchFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{branch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Branch Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter branch name"
              required
            />
          </div>

          <div>
            <Label htmlFor="code">Branch Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              placeholder="Enter branch code (e.g., NBO, MSA)"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter full address"
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Enter city"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <Button type="submit" disabled={saveBranchMutation.isPending} className="w-full">
            {saveBranchMutation.isPending ? 'Saving...' : (branch ? 'Update Branch' : 'Create Branch')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const BranchManagement = () => {
  const { currentBranch, isSuperAdmin } = useBranch();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: allBranches, isLoading } = useQuery({
    queryKey: ['all-branches'],
    queryFn: async (): Promise<Branch[]> => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isSuperAdmin,
  });

  const toggleBranchStatusMutation = useMutation({
    mutationFn: async ({ branchId, isActive }: { branchId: string, isActive: boolean }) => {
      const { error } = await supabase
        .from('branches')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', branchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Branch status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['all-branches'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating branch status: ${error.message}`);
    }
  });

  const handleEditBranch = (branch?: Branch) => {
    setSelectedBranch(branch);
    setEditDialogOpen(true);
  };

  const handleToggleBranchStatus = (branchId: string, currentStatus: boolean) => {
    toggleBranchStatusMutation.mutate({ 
      branchId, 
      isActive: !currentStatus 
    });
  };

  // Single branch view for branch admins
  if (!isSuperAdmin && currentBranch && typeof currentBranch === 'object') {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Branch Information
              </CardTitle>
              <CardDescription>
                Manage your branch details
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => handleEditBranch(currentBranch)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="font-medium">{currentBranch.name}</p>
              <p className="text-sm text-muted-foreground">Code: {currentBranch.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{currentBranch.address}</p>
              <p className="text-sm text-muted-foreground">{currentBranch.city}</p>
            </div>
            {currentBranch.phone && (
              <p className="text-sm"><strong>Phone:</strong> {currentBranch.phone}</p>
            )}
            {currentBranch.email && (
              <p className="text-sm"><strong>Email:</strong> {currentBranch.email}</p>
            )}
          </div>
        </CardContent>

        <BranchEditDialog
          branch={selectedBranch}
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedBranch(undefined);
          }}
        />
      </Card>
    );
  }

  // SuperAdmin view - manage all branches
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Branch Management
              </CardTitle>
              <CardDescription>
                Manage all branches in the system
              </CardDescription>
            </div>
            <Button onClick={() => handleEditBranch()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Details</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBranches?.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{branch.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Code: {branch.code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{branch.city}</div>
                          <div className="text-xs text-muted-foreground">{branch.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {branch.phone && <div>📞 {branch.phone}</div>}
                          {branch.email && <div>📧 {branch.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={branch.is_active ? 'default' : 'secondary'}>
                          {branch.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditBranch(branch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleBranchStatus(branch.id, branch.is_active)}
                            disabled={toggleBranchStatusMutation.isPending}
                          >
                            {branch.is_active ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BranchEditDialog
        branch={selectedBranch}
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedBranch(undefined);
        }}
      />
    </div>
  );
};

export default BranchManagement;
