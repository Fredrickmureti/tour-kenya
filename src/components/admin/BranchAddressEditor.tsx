
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapPin, Edit } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';

interface BranchAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
}

const BranchAddressEditor = () => {
  const { currentBranch, isSuperAdmin } = useBranch();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: ''
  });
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (currentBranch && typeof currentBranch === 'object') {
      setFormData({
        name: currentBranch.name || '',
        address: currentBranch.address || '',
        city: currentBranch.city || '',
        phone: currentBranch.phone || '',
        email: currentBranch.email || ''
      });
    }
  }, [currentBranch]);

  const updateBranchMutation = useMutation({
    mutationFn: async (updatedData: typeof formData) => {
      if (!currentBranch || typeof currentBranch !== 'object') {
        throw new Error('No branch selected or invalid branch data');
      }

      const { data, error } = await supabase
        .from('branches')
        .update({
          name: updatedData.name,
          address: updatedData.address,
          city: updatedData.city,
          phone: updatedData.phone || null,
          email: updatedData.email || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentBranch.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Branch information updated successfully!');
      setIsOpen(false);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['admin-receipts'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating branch: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    updateBranchMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Don't show for super admin viewing all branches
  if (!currentBranch || currentBranch === 'all' || typeof currentBranch !== 'object') {
    return null;
  }

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
              Manage your branch address and contact details
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Branch Information</DialogTitle>
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

                <Button type="submit" disabled={updateBranchMutation.isPending} className="w-full">
                  {updateBranchMutation.isPending ? 'Updating...' : 'Update Branch Information'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="font-medium">{currentBranch.name}</p>
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
    </Card>
  );
};

export default BranchAddressEditor;
