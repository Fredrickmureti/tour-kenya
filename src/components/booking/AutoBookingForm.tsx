import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CalendarDays, Clock, MapPin, Users, CreditCard } from 'lucide-react';
import PaymentMethodSelector from '@/components/booking/PaymentMethodSelector';

interface Route {
  id: string;
  from_location: string;
  to_location: string;
  price: number;
  duration: string;
  departure_times: string[];
}

interface BookingFormData {
  route_id: string;
  departure_date: string;
  departure_time: string;
  seat_numbers: number[];
  payment_method: string;
}

const AutoBookingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BookingFormData>({
    route_id: '',
    departure_date: '',
    departure_time: '',
    seat_numbers: [],
    payment_method: 'Card'
  });
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  // Fetch available routes
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: async (): Promise<Route[]> => {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('from_location');
      
      if (error) throw error;
      return data || [];
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingFormData) => {
      if (!user) throw new Error('User not authenticated');

      // Get route details for pricing
      const route = routes?.find(r => r.id === bookingData.route_id);
      if (!route) throw new Error('Route not found');

      const totalPrice = route.price * bookingData.seat_numbers.length;

      // Convert seat numbers to strings for database storage
      const seatNumbersAsStrings = bookingData.seat_numbers.map(num => num.toString());

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          route_id: bookingData.route_id,
          from_location: route.from_location,
          to_location: route.to_location,
          departure_date: bookingData.departure_date,
          departure_time: bookingData.departure_time,
          arrival_time: route.duration, // This should be calculated properly
          seat_numbers: seatNumbersAsStrings,
          price: totalPrice,
          status: 'upcoming'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create receipt
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          booking_id: booking.id,
          user_id: user.id,
          amount: totalPrice,
          payment_method: bookingData.payment_method,
          payment_status: 'Paid'
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      return { booking, receipt };
    },
    onSuccess: (data) => {
      toast.success('Booking created successfully!');
      
      // Type the receipt data properly
      const receiptData = data.receipt as any;
      const receiptId = receiptData?.id;
      
      if (receiptId) {
        navigate(`/dashboard/receipt/${receiptId}`);
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      toast.error(`Booking failed: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.route_id || !formData.departure_date || !formData.departure_time || selectedSeats.length === 0) {
      toast.error('Please fill in all required fields and select at least one seat');
      return;
    }

    const bookingData = {
      ...formData,
      seat_numbers: selectedSeats
    };

    createBookingMutation.mutate(bookingData);
  };

  const handleSeatToggle = (seatNumber: number) => {
    setSelectedSeats(prev => 
      prev.includes(seatNumber) 
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const getTotalPrice = () => {
    const route = routes?.find(r => r.id === formData.route_id);
    return route ? route.price * selectedSeats.length : 0;
  };

  if (routesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Book Your Journey
          </CardTitle>
          <CardDescription>
            Select your route, date, time, and seats to complete your booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Route</Label>
              <RadioGroup 
                value={formData.route_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, route_id: value }))}
                className="grid gap-3"
              >
                {routes?.map((route) => (
                  <div key={route.id} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                    <RadioGroupItem value={route.id} id={route.id} />
                    <Label htmlFor={route.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{route.from_location} → {route.to_location}</p>
                          <p className="text-sm text-gray-500">Duration: {route.duration}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">KES {route.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">per seat</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Date and Time Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure_date" className="flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Departure Date
                </Label>
                <Input
                  type="date"
                  id="departure_date"
                  value={formData.departure_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, departure_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departure_time" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Departure Time
                </Label>
                <RadioGroup 
                  value={formData.departure_time} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, departure_time: value }))}
                  className="flex flex-wrap gap-2"
                >
                  {formData.route_id && routes?.find(r => r.id === formData.route_id)?.departure_times.map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <RadioGroupItem value={time} id={time} />
                      <Label htmlFor={time} className="cursor-pointer">
                        <Badge variant="outline">{time}</Badge>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Seat Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Select Seats ({selectedSeats.length} selected)
              </Label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2 p-4 border rounded-lg bg-gray-50">
                {Array.from({ length: 40 }, (_, i) => i + 1).map((seatNumber) => (
                  <Button
                    key={seatNumber}
                    type="button"
                    variant={selectedSeats.includes(seatNumber) ? "default" : "outline"}
                    size="sm"
                    className="aspect-square"
                    onClick={() => handleSeatToggle(seatNumber)}
                  >
                    {seatNumber}
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <PaymentMethodSelector
              selectedMethod={formData.payment_method}
              onMethodChange={(method) => setFormData(prev => ({ ...prev, payment_method: method }))}
            />

            {/* Booking Summary */}
            {selectedSeats.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Total Amount</p>
                      <p className="text-sm text-gray-600">
                        {selectedSeats.length} seat(s) × KES {routes?.find(r => r.id === formData.route_id)?.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">KES {getTotalPrice().toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createBookingMutation.isPending || selectedSeats.length === 0}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {createBookingMutation.isPending ? 'Processing...' : `Complete Booking - KES ${getTotalPrice().toFixed(2)}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoBookingForm;
