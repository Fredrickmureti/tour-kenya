
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Trash, Eye, Palette, Type, Layout, Upload, Save } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';

const templateSchema = z.object({
  template_name: z.string().min(1, 'Template name is required'),
  company_name: z.string().min(1, 'Company name is required'),
  company_tagline: z.string().min(1, 'Company tagline is required'),
  primary_color: z.string().min(1, 'Primary color is required'),
  secondary_color: z.string().min(1, 'Secondary color is required'),
  accent_color: z.string().min(1, 'Accent color is required'),
  background_gradient: z.string().min(1, 'Background gradient is required'),
  header_font: z.string().min(1, 'Header font is required'),
  body_font: z.string().min(1, 'Body font is required'),
  header_style: z.string().min(1, 'Header style is required'),
  show_qr_code: z.boolean(),
  show_fleet_details: z.boolean(),
  show_weather_info: z.boolean(),
  header_message: z.string().optional(),
  footer_message: z.string().min(1, 'Footer message is required'),
  terms_and_conditions: z.string().optional(),
  promotional_message: z.string().optional(),
  logo_url: z.string().optional(),
  support_phone: z.string().optional(),
  support_email: z.string().optional(),
  website_url: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export const ReceiptTemplateManager = () => {
  const queryClient = useQueryClient();
  const { getCurrentBranchFilter, isSuperAdmin } = useBranch();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      template_name: '',
      company_name: 'RouteAura Bus Services',
      company_tagline: 'Your Trusted Travel Partner',
      primary_color: '#2563eb',
      secondary_color: '#16a34a',
      accent_color: '#dc2626',
      background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      header_font: 'Inter',
      body_font: 'Inter',
      header_style: 'gradient',
      show_qr_code: true,
      show_fleet_details: true,
      show_weather_info: false,
      footer_message: 'Thank you for choosing our services!',
    },
  });

  // Fetch receipt templates with proper null handling
  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['receipt-templates', getCurrentBranchFilter()],
    queryFn: async () => {
      const branchFilter = getCurrentBranchFilter();
      
      console.log('Branch filter:', branchFilter); // Debug log
      
      let query = supabase
        .from('receipt_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Only apply branch filter if we have a valid branch ID
      if (branchFilter && branchFilter !== 'null') {
        query = query.eq('branch_id', branchFilter);
      } else if (!isSuperAdmin) {
        // For non-superadmins without a valid branch, return empty array
        return [];
      }
      // For superadmins, don't apply any branch filter to see all templates

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }
      
      console.log('Fetched templates:', data); // Debug log
      return data || [];
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (values: TemplateFormValues) => {
      const branchFilter = getCurrentBranchFilter();
      
      const { data, error } = await supabase
        .from('receipt_templates')
        .insert({
          ...values,
          branch_id: branchFilter && branchFilter !== 'null' ? branchFilter : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Receipt template created successfully');
      setIsAddDialogOpen(false);
      form.reset();
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error creating template: ${error.message}`);
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async (values: TemplateFormValues) => {
      if (!selectedTemplate) return;

      const { data, error } = await supabase
        .from('receipt_templates')
        .update(values)
        .eq('id', selectedTemplate.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Receipt template updated successfully');
      setIsEditDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error updating template: ${error.message}`);
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('receipt_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Receipt template deleted successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error deleting template: ${error.message}`);
    },
  });

  // Set template as default
  const setDefaultMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const branchFilter = getCurrentBranchFilter();
      
      // First, unset all other defaults for this branch
      let resetQuery = supabase
        .from('receipt_templates')
        .update({ is_default: false });
      
      if (branchFilter && branchFilter !== 'null') {
        resetQuery = resetQuery.eq('branch_id', branchFilter);
      } else {
        resetQuery = resetQuery.is('branch_id', null);
      }
      
      await resetQuery;

      // Then set the selected template as default
      const { error } = await supabase
        .from('receipt_templates')
        .update({ is_default: true })
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Default template updated successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error setting default template: ${error.message}`);
    },
  });

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    form.reset({
      template_name: template.template_name,
      company_name: template.company_name,
      company_tagline: template.company_tagline,
      primary_color: template.primary_color,
      secondary_color: template.secondary_color,
      accent_color: template.accent_color,
      background_gradient: template.background_gradient,
      header_font: template.header_font,
      body_font: template.body_font,
      header_style: template.header_style,
      show_qr_code: template.show_qr_code,
      show_fleet_details: template.show_fleet_details,
      show_weather_info: template.show_weather_info,
      header_message: template.header_message || '',
      footer_message: template.footer_message,
      terms_and_conditions: template.terms_and_conditions || '',
      promotional_message: template.promotional_message || '',
      logo_url: template.logo_url || '',
      support_phone: template.support_phone || '',
      support_email: template.support_email || '',
      website_url: template.website_url || '',
    });
    setIsEditDialogOpen(true);
  };

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const onSubmit = (values: TemplateFormValues) => {
    if (selectedTemplate) {
      updateTemplateMutation.mutate(values);
    } else {
      createTemplateMutation.mutate(values);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Receipt Template Manager</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : templates?.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">No receipt templates found</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates?.map((template: any) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.template_name}</CardTitle>
                  <div className="flex gap-2">
                    {template.is_default && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Default
                      </Badge>
                    )}
                    {template.is_active && (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview Colors */}
                <div className="flex space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: template.primary_color }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: template.secondary_color }}
                    title="Secondary Color"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: template.accent_color }}
                    title="Accent Color"
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  <p><strong>Company:</strong> {template.company_name}</p>
                  <p><strong>Tagline:</strong> {template.company_tagline}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {template.show_qr_code && <Badge variant="outline" className="text-xs">QR Code</Badge>}
                  {template.show_fleet_details && <Badge variant="outline" className="text-xs">Fleet Details</Badge>}
                  {template.show_weather_info && <Badge variant="outline" className="text-xs">Weather</Badge>}
                </div>

                <div className="flex justify-between gap-2 pt-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    {!template.is_default && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDefaultMutation.mutate(template.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200"
                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Template Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedTemplate(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Receipt Template' : 'Create Receipt Template'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="template_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="company_tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Tagline</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color Scheme */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium mb-4 flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Color Scheme
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="primary_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="secondary_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accent_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent Color</FormLabel>
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="background_gradient"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Background Gradient (CSS)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
                      </FormControl>
                      <FormDescription>
                        Enter a CSS gradient value for the header background
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Typography & Layout */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium mb-4 flex items-center">
                  <Type className="h-5 w-5 mr-2" />
                  Typography & Layout
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="header_font"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header Font</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Montserrat">Montserrat</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="body_font"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Font</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Montserrat">Montserrat</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="header_style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gradient">Gradient</SelectItem>
                            <SelectItem value="solid">Solid</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium mb-4 flex items-center">
                  <Layout className="h-5 w-5 mr-2" />
                  Features
                </h4>
                <div className="grid grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="show_qr_code"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">QR Code</FormLabel>
                          <FormDescription>
                            Show QR code for verification
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="show_fleet_details"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Fleet Details</FormLabel>
                          <FormDescription>
                            Show bus type and amenities
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="show_weather_info"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Weather Info</FormLabel>
                          <FormDescription>
                            Show weather for travel date
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Custom Content */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium mb-4">Custom Content</h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="header_message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header Message (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Special message for header" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="footer_message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer Message</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="promotional_message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotional Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Special offers or promotions" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="terms_and_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms and Conditions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Terms and conditions text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact & Branding */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium mb-4">Contact & Branding</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/logo.png" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="website_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="support_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+254 700 000 000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="support_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="support@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setSelectedTemplate(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {selectedTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptTemplateManager;
