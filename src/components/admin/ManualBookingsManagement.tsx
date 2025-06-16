
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Download, Search, FileText } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface ManualBooking {
  id: string;
  passenger_name: string;
  passenger_email: string | null;
  passenger_phone: string | null;
  admin_email: string;
  booking_id: string | null;
  branch_id: string | null;
  created_at: string;
  bookings?: {
    from_location: string;
    to_location: string;
    departure_date: string;
    departure_time: string;
    price: number;
    seat_numbers: string[];
    status: string;
  } | null;
  branches?: {
    name: string;
  } | null;
}

interface Route {
  id: string;
  from_location: string;
  to_location: string;
  price: number;
  departure_times: string[];
}

const CreateManualBookingForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [seatNumbers, setSeatNumbers] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { getCurrentBranchFilter } = useBranch();
  const { adminUser } = useAdminAuth();

  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['manual-booking-routes', getCurrentBranchFilter()],
    queryFn: async (): Promise<Route[]> => {
      const branchIdFilter = getCurrentBranchFilter();
      
      let query = supabase.from('routes').select('*');
      
      if (branchIdFilter) {
        query = query.eq('branch_id', branchIdFilter);
      }

      const { data, error } = await query.order('from_location');
      
      if (error) throw error;
      return data || [];
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const branchId = getCurrentBranchFilter();
      const route = routes?.find(r => r.id === selectedRoute);
      
      if (!route) throw new Error('Route not found');
      if (!adminUser) throw new Error('Admin user not found');

      // Create the booking first
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: adminUser.id, // Using admin as placeholder user
          route_id: selectedRoute,
          from_location: route.from_location,
          to_location: route.to_location,
          departure_date: departureDate,
          departure_time: departureTime,
          arrival_time: departureTime, // Simplified for now
          seat_numbers: seatNumbers.split(',').map(s => s.trim()),
          price: route.price,
          status: 'upcoming',
          branch_id: branchId
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create manual booking record
      const { data: manualBooking, error: manualError } = await supabase
        .from('manual_bookings')
        .insert({
          passenger_name: passengerName,
          passenger_email: passengerEmail || null,
          passenger_phone: passengerPhone || null,
          admin_email: adminUser.email,
          booking_id: booking.id,
          branch_id: branchId
        })
        .select()
        .single();

      if (manualError) throw manualError;

      // Create receipt
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          booking_id: booking.id,
          user_id: adminUser.id,
          amount: route.price,
          payment_status: 'Paid',
          payment_method: 'Cash'
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      return { booking, manualBooking, receipt };
    },
    onSuccess: (data) => {
      toast.success('Manual booking created successfully!');
      onSuccess();
      // Reset form
      setPassengerName('');
      setPassengerEmail('');
      setPassengerPhone('');
      setSelectedRoute('');
      setDepartureDate('');
      setDepartureTime('');
      setSeatNumbers('');
    },
    onError: (error: any) => {
      toast.error(`Error creating booking: ${error.message}`);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName || !selectedRoute || !departureDate || !departureTime || !seatNumbers) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    createBookingMutation.mutate({});
    setIsSubmitting(false);
  };

  const selectedRouteData = routes?.find(r => r.id === selectedRoute);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="passengerName">Passenger Name *</Label>
        <Input
          id="passengerName"
          value={passengerName}
          onChange={(e) => setPassengerName(e.target.value)}
          placeholder="Enter passenger name"
          required
        />
      </div>

      <div>
        <Label htmlFor="passengerEmail">Passenger Email</Label>
        <Input
          id="passengerEmail"
          type="email"
          value={passengerEmail}
          onChange={(e) => setPassengerEmail(e.target.value)}
          placeholder="Enter passenger email (optional)"
        />
      </div>

      <div>
        <Label htmlFor="passengerPhone">Passenger Phone</Label>
        <Input
          id="passengerPhone"
          value={passengerPhone}
          onChange={(e) => setPassengerPhone(e.target.value)}
          placeholder="Enter passenger phone (optional)"
        />
      </div>

      <div>
        <Label htmlFor="route">Route *</Label>
        <Select value={selectedRoute} onValueChange={setSelectedRoute} required>
          <SelectTrigger>
            <SelectValue placeholder="Select route" />
          </SelectTrigger>
          <SelectContent>
            {routes?.map((route) => (
              <SelectItem key={route.id} value={route.id}>
                {route.from_location} → {route.to_location} (KSh {route.price})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="departureDate">Departure Date *</Label>
          <Input
            id="departureDate"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div>
          <Label htmlFor="departureTime">Departure Time *</Label>
          <Select value={departureTime} onValueChange={setDepartureTime} required>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {selectedRouteData?.departure_times?.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="seatNumbers">Seat Numbers *</Label>
        <Input
          id="seatNumbers"
          value={seatNumbers}
          onChange={(e) => setSeatNumbers(e.target.value)}
          placeholder="Enter seat numbers (e.g., 1A, 2B, 3C)"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Separate multiple seats with commas
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting || isLoadingRoutes} className="w-full">
        {isSubmitting ? 'Creating...' : 'Create Manual Booking'}
      </Button>
    </form>
  );
};

const ManualBookingsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);
  const { getCurrentBranchFilter, isSuperAdmin, currentBranch } = useBranch();
  const queryClient = useQueryClient();
  
  const { data: manualBookings, isLoading, refetch } = useQuery({
    queryKey: ['manual-bookings', getCurrentBranchFilter()],
    queryFn: async (): Promise<ManualBooking[]> => {
      const branchIdFilter = getCurrentBranchFilter();
      
      let query = supabase
        .from('manual_bookings')
        .select(`
          *,
          bookings (
            from_location,
            to_location,
            departure_date,
            departure_time,
            price,
            seat_numbers,
            status
          ),
          branches (name)
        `)
        .order('created_at', { ascending: false });

      if (branchIdFilter) {
        query = query.eq('branch_id', branchIdFilter);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading manual bookings:', error);
        toast.error(`Error loading manual bookings: ${error.message}`);
        throw error;
      }
      
      return data || [];
    },
  });

  const filteredBookings = manualBookings?.filter(booking => 
    !searchTerm || 
    booking.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.passenger_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.bookings?.from_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.bookings?.to_location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  useEffect(() => {
    const channel = supabase
      .channel('manual-bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'manual_bookings' }, () => refetch())
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const downloadReceipt = async (bookingId: string) => {
    try {
      const { data: receipt, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (error) throw error;

      if (receipt) {
        // Create a simple receipt download (you can enhance this with proper PDF generation)
        const receiptData = `
Receipt Number: ${receipt.receipt_number}
Booking ID: ${bookingId}
Amount: KSh ${receipt.amount}
Payment Method: ${receipt.payment_method}
Date: ${new Date(receipt.generated_at).toLocaleDateString()}
        `;
        
        const blob = new Blob([receiptData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${receipt.receipt_number}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Receipt downloaded successfully');
      }
    } catch (error: any) {
      toast.error(`Error downloading receipt: ${error.message}`);
    }
  };

  const getBranchDisplayName = () => {
    if (currentBranch === 'all') return 'All Branches';
    if (currentBranch && typeof currentBranch === 'object') return currentBranch.name;
    return 'Unknown Branch';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Manual Bookings Management
              </CardTitle>
              <CardDescription>
                Create bookings for walk-in customers at {getBranchDisplayName()}
              </CardDescription>
            </div>
            <Dialog open={isCreateBookingOpen} onOpenChange={setIsCreateBookingOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Manual Booking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Manual Booking</DialogTitle>
                </DialogHeader>
                <CreateManualBookingForm 
                  onSuccess={() => {
                    setIsCreateBookingOpen(false);
                    refetch();
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-gray-50">
              <p className="text-muted-foreground">No manual bookings found.</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    {isSuperAdmin && <TableHead>Branch</TableHead>}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.passenger_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.passenger_email || 'No email'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.passenger_phone || 'No phone'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.bookings?.from_location} → {booking.bookings?.to_location}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Seats: {booking.bookings?.seat_numbers?.join(', ')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(booking.bookings?.departure_date || '').toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{booking.bookings?.departure_time}</div>
                        </div>
                      </TableCell>
                      <TableCell>KSh {booking.bookings?.price?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={booking.bookings?.status === 'upcoming' ? 'default' : 'secondary'}>
                          {booking.bookings?.status}
                        </Badge>
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>{booking.branches?.name || 'N/A'}</TableCell>
                      )}
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => booking.booking_id && downloadReceipt(booking.booking_id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
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

export default ManualBookingsManagement;
