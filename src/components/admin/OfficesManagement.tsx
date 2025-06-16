
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { MapPin, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

const OfficesManagement = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingOffice, setEditingOffice] = useState<any>(null);
  const [formData, setFormData] = useState({
    city: '',
    address: '',
    phone: '',
    email: '',
    hours: '',
    map_url: '',
    is_active: true
  });

  // Fetch offices
  const { data: offices, isLoading } = useQuery({
    queryKey: ['admin-offices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_offices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Add/Update office mutation
  const saveOfficeMutation = useMutation({
    mutationFn: async (officeData: any) => {
      if (editingOffice) {
        const { error } = await supabase
          .from('admin_offices')
          .update(officeData)
          .eq('id', editingOffice.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_offices')
          .insert(officeData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offices'] });
      toast.success(editingOffice ? 'Office updated successfully' : 'Office added successfully');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error saving office: ${error.message}`);
    },
  });

  // Delete office mutation
  const deleteOfficeMutation = useMutation({
    mutationFn: async (officeId: string) => {
      const { error } = await supabase
        .from('admin_offices')
        .delete()
        .eq('id', officeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offices'] });
      toast.success('Office deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting office: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      city: '',
      address: '',
      phone: '',
      email: '',
      hours: '',
      map_url: '',
      is_active: true
    });
    setIsAdding(false);
    setEditingOffice(null);
  };

  const handleEdit = (office: any) => {
    setEditingOffice(office);
    setFormData({
      city: office.city,
      address: office.address,
      phone: office.phone,
      email: office.email,
      hours: office.hours,
      map_url: office.map_url,
      is_active: office.is_active
    });
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!formData.city || !formData.address || !formData.phone || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    saveOfficeMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Offices Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage office locations and information</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Office
        </Button>
      </div>

      {isAdding && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>
              {editingOffice ? 'Edit Office' : 'Add New Office'}
            </CardTitle>
            <CardDescription>
              Fill in the office details and map embed URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label htmlFor="hours">Operating Hours</Label>
              <Input
                id="hours"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                placeholder="e.g., Monday - Sunday: 6:00 AM - 10:00 PM"
              />
            </div>

            <div>
              <Label htmlFor="map_url">Google Maps Embed URL</Label>
              <Textarea
                id="map_url"
                rows={3}
                value={formData.map_url}
                onChange={(e) => setFormData(prev => ({ ...prev, map_url: e.target.value }))}
                placeholder="Paste the Google Maps embed URL here"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active (visible on website)</Label>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleSave}
                disabled={saveOfficeMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                {saveOfficeMutation.isPending ? 'Saving...' : 'Save Office'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : offices && offices.length > 0 ? (
          offices.map((office: any) => (
            <Card key={office.id} className="hover:shadow-lg transition-shadow animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    {office.city}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={office.is_active ? 'default' : 'secondary'}>
                      {office.is_active ? (
                        <>
                          <Eye className="mr-1 h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="mr-1 h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  {office.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p><strong>Phone:</strong> {office.phone}</p>
                  <p><strong>Email:</strong> {office.email}</p>
                  {office.hours && <p><strong>Hours:</strong> {office.hours}</p>}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(office)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this office?')) {
                        deleteOfficeMutation.mutate(office.id);
                      }
                    }}
                    disabled={deleteOfficeMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No offices added yet</p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Office
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficesManagement;
