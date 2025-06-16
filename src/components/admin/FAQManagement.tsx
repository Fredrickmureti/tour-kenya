
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const FAQManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    is_active: true,
    display_order: 0,
  });

  // Fetch all FAQs
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as FAQ[];
    },
  });

  // Create FAQ mutation
  const createMutation = useMutation({
    mutationFn: async (newFAQ: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('faqs')
        .insert([newFAQ]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['public-faqs'] });
      toast.success('FAQ created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to create FAQ: ${error.message}`);
    },
  });

  // Update FAQ mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FAQ> & { id: string }) => {
      const { error } = await supabase
        .from('faqs')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['public-faqs'] });
      toast.success('FAQ updated successfully');
      setIsDialogOpen(false);
      setEditingFAQ(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to update FAQ: ${error.message}`);
    },
  });

  // Delete FAQ mutation
  const deleteMutation = useMutation({
    mutationFn: async (faqId: string) => {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', faqId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['public-faqs'] });
      toast.success('FAQ deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete FAQ: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      is_active: true,
      display_order: 0,
    });
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_active: faq.is_active,
      display_order: faq.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.question || !formData.answer || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingFAQ) {
      updateMutation.mutate({
        id: editingFAQ.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (faq: FAQ) => {
    updateMutation.mutate({
      id: faq.id,
      is_active: !faq.is_active,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">FAQ Management</h2>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            FAQs
          </CardTitle>
          <CardDescription>
            Manage questions and answers displayed on the FAQ page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : faqs && faqs.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <div className="max-w-xs truncate font-medium">
                          {faq.question}
                        </div>
                      </TableCell>
                      <TableCell>{faq.category}</TableCell>
                      <TableCell>{faq.display_order}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={faq.is_active}
                            onCheckedChange={() => handleToggleActive(faq)}
                          />
                          <span className="text-sm">
                            {faq.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(faq.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(faq)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate(faq.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-gray-50">
              <p className="text-muted-foreground">No FAQs found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit FAQ Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Question</label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter the question"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Answer</label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Enter the answer"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Booking & Tickets"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Display Order</label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingFAQ ? 'Update' : 'Create'} FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQManagement;
