
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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

interface ExportFilters {
  startDate?: Date;
  endDate?: Date;
  branchId?: string;
  exportType: 'bookings' | 'reschedule_requests';
}

export const DataExportManager: React.FC = () => {
  const { adminUser, refreshSession } = useAdminAuth();
  const [filters, setFilters] = useState<ExportFilters>({ exportType: 'bookings' });
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  React.useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, city')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const establishAdminSession = async () => {
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const { error } = await supabase.rpc('establish_admin_session', {
      admin_user_id: adminUser.id
    });

    if (error) {
      throw new Error('Failed to establish admin session');
    }
  };

  const exportData = async () => {
    if (!adminUser) {
      toast.error('Admin session required');
      return;
    }

    setIsExporting(true);
    try {
      // Establish admin session first
      await establishAdminSession();

      let data, error;
      
      if (filters.exportType === 'bookings') {
        ({ data, error } = await supabase.rpc('export_bookings_data', {
          p_start_date: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : null,
          p_end_date: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : null,
          p_branch_id: filters.branchId === 'all' ? null : (filters.branchId || null)
        }));
      } else {
        // For reschedule requests, we'll use a direct query since the function might not be in types yet
        let query = supabase
          .from('reschedule_requests')
          .select(`
            id,
            booking_id,
            user_id,
            current_departure_date,
            current_departure_time,
            requested_departure_date,
            requested_departure_time,
            reason,
            status,
            admin_notes,
            fee_amount,
            created_at,
            processed_at,
            bookings!inner(
              from_location,
              to_location,
              branch_id,
              profiles(full_name, phone),
              manual_bookings(passenger_name, passenger_phone, passenger_email)
            )
          `);

        if (filters.startDate) {
          query = query.gte('created_at', format(filters.startDate, 'yyyy-MM-dd'));
        }
        if (filters.endDate) {
          query = query.lte('created_at', format(filters.endDate, 'yyyy-MM-dd'));
        }
        if (filters.branchId && filters.branchId !== 'all') {
          query = query.eq('bookings.branch_id', filters.branchId);
        }

        const result = await query.order('created_at', { ascending: false });
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      // Convert data to CSV format
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => {
            const value = row[header];
            if (Array.isArray(value)) {
              return `"${value.join('; ')}"`;
            }
            return `"${value || ''}"`;
          }).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filters.exportType}_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`Exported ${data.length} ${filters.exportType} records`);
      } else {
        toast.info('No data found for the selected criteria');
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`);
      
      // Try to refresh session once and retry
      if (error.message?.includes('Access denied') || error.message?.includes('privileges required')) {
        console.log('Attempting to refresh session and retry export...');
        const sessionRefreshed = await refreshSession();
        if (sessionRefreshed) {
          // Don't retry automatically, let user click again
          toast.info('Session refreshed. Please try the export again.');
        }
      }
    } finally {
      setIsExporting(false);
    }
  };

  const bulkDeleteData = async () => {
    if (!adminUser) {
      toast.error('Admin session required');
      return;
    }

    setIsDeleting(true);
    try {
      // Establish admin session first
      await establishAdminSession();

      let data, error;
      
      if (filters.exportType === 'bookings') {
        ({ data, error } = await supabase.rpc('bulk_delete_bookings', {
          p_start_date: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : null,
          p_end_date: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : null,
          p_branch_id: filters.branchId === 'all' ? null : (filters.branchId || null),
          p_admin_id: adminUser.id
        }));
      } else {
        // For reschedule requests, we'll use direct deletion since the function might not be in types yet
        let deleteQuery = supabase.from('reschedule_requests');
        
        if (filters.startDate || filters.endDate || (filters.branchId && filters.branchId !== 'all')) {
          // We need to first get the IDs that match our criteria
          let selectQuery = supabase
            .from('reschedule_requests')
            .select('id, booking_id');
            
          if (filters.startDate) {
            selectQuery = selectQuery.gte('created_at', format(filters.startDate, 'yyyy-MM-dd'));
          }
          if (filters.endDate) {
            selectQuery = selectQuery.lte('created_at', format(filters.endDate, 'yyyy-MM-dd'));
          }
          
          const { data: idsToDelete, error: selectError } = await selectQuery;
          if (selectError) throw selectError;
          
          if (idsToDelete && idsToDelete.length > 0) {
            const ids = idsToDelete.map(item => item.id);
            const { error: deleteError } = await supabase
              .from('reschedule_requests')
              .delete()
              .in('id', ids);
              
            if (deleteError) throw deleteError;
            
            data = { requests_deleted: idsToDelete.length };
          } else {
            data = { requests_deleted: 0 };
          }
        } else {
          // Delete all if no filters
          const { error: deleteError } = await supabase
            .from('reschedule_requests')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            
          if (deleteError) throw deleteError;
          data = { requests_deleted: 'unknown' };
        }
        
        error = null;
      }

      if (error) throw error;

      const result = data as any;
      if (filters.exportType === 'bookings') {
        toast.success(
          `Successfully deleted: ${result.bookings_deleted} bookings, ${result.receipts_deleted} receipts, ${result.manual_bookings_deleted} manual bookings`
        );
      } else {
        toast.success(`Successfully deleted: ${result.requests_deleted} reschedule requests`);
      }
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      toast.error(`Bulk delete failed: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!adminUser) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Export & Management</h2>
        <p className="text-muted-foreground">Export and manage database records (Superadmin only)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="exportType">Data Type</Label>
          <Select 
            value={filters.exportType} 
            onValueChange={(value: 'bookings' | 'reschedule_requests') => 
              setFilters(prev => ({ ...prev, exportType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bookings">Bookings & Receipts</SelectItem>
              <SelectItem value="reschedule_requests">Reschedule Requests</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? format(filters.endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="branch">Branch (Optional)</Label>
          <Select value={filters.branchId || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, branchId: value === 'all' ? undefined : value }))}>
            <SelectTrigger>
              <SelectValue placeholder="All branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name} - {branch.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={exportData} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : `Export ${filters.exportType}`}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : `Bulk Delete ${filters.exportType}`}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Bulk Deletion
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete all {filters.exportType} and related data matching the selected criteria. 
                This action cannot be undone. Make sure you have exported any data you need before proceeding.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={bulkDeleteData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Usage Guidelines:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Export data before performing bulk deletions for backup purposes</li>
          <li>Use date filters to target specific time periods</li>
          <li>Branch filter allows deletion/export for specific locations</li>
          <li>All operations are logged for audit purposes</li>
          <li>Only superadmins can perform these operations</li>
          <li>Reschedule request exports include customer details and processing status</li>
        </ul>
      </div>
    </div>
  );
};

export default DataExportManager;
