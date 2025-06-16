
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UltraPremiumReceiptGenerator } from '@/components/admin/UltraPremiumReceiptGenerator';

interface ReceiptDetails {
  receipt_id: string;
  booking_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_phone: string;
  route_name: string;
  departure_location_name: string;
  arrival_location_name: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  branch_id?: string;
  branch_name: string;
  branch_address: string;
  branch_phone?: string;
  branch_email?: string;
  seat_numbers: string[];
  receipt_number: string;
  fleet_name?: string;
  fleet_description?: string;
  fleet_features?: string[];
  fleet_capacity?: number;
  fleet_image_url?: string;
  bus_id?: string;
  receipt_status?: string;
}

const ReceiptPage: React.FC = () => {
  const { receiptId } = useParams<{ receiptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetails | null>(location.state?.receiptDetails || null);
  const [isLoading, setIsLoading] = useState(!receiptDetails);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!receiptId) {
        setError('Receipt ID is missing.');
        setIsLoading(false);
        return;
      }
      if (receiptDetails) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error: rpcError } = await supabase.rpc('get_receipt_details', { p_receipt_id: receiptId });

        if (rpcError) {
          throw rpcError;
        }

        if (data && typeof data === 'object') {
          const receipt = data as unknown as ReceiptDetails;
          console.log('Receipt details received:', receipt);
          setReceiptDetails(receipt);
        } else {
          setError('Receipt not found.');
          toast.error('Could not load receipt details.');
        }
      } catch (err: any) {
        console.error('Error fetching receipt details:', err);
        setError(err.message || 'Failed to fetch receipt details.');
        toast.error(err.message || 'Failed to fetch receipt details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipt();
  }, [receiptId, receiptDetails]);
  
  const goBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <Button variant="outline" onClick={goBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading premium receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <Button variant="outline" onClick={goBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-center py-12 text-red-500">
          <h3 className="text-xl font-semibold mb-2">Error Loading Receipt</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!receiptDetails) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <Button variant="outline" onClick={goBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">Receipt Not Found</h3>
          <p className="text-muted-foreground">The requested receipt could not be found.</p>
        </div>
      </div>
    );
  }

  // Transform receipt details to match UltraPremiumReceiptGenerator interface
  const receiptData = {
    receipt_id: receiptDetails.receipt_id,
    receipt_number: receiptDetails.receipt_number,
    booking_id: receiptDetails.booking_id,
    passenger_name: receiptDetails.user_name,
    passenger_phone: receiptDetails.user_phone,
    passenger_email: receiptDetails.user_email,
    from_location: receiptDetails.departure_location_name,
    to_location: receiptDetails.arrival_location_name,
    departure_date: receiptDetails.departure_time ? new Date(receiptDetails.departure_time).toLocaleDateString() : 'N/A',
    departure_time: receiptDetails.departure_time ? new Date(receiptDetails.departure_time).toLocaleTimeString() : 'N/A',
    arrival_time: receiptDetails.arrival_time ? new Date(receiptDetails.arrival_time).toLocaleTimeString() : 'N/A',
    seat_numbers: receiptDetails.seat_numbers || [],
    amount_paid: receiptDetails.price,
    generated_at: receiptDetails.created_at,
    branch_name: receiptDetails.branch_name,
    branch_address: receiptDetails.branch_address,
    payment_method: receiptDetails.payment_method,
    payment_status: receiptDetails.payment_status,
    fleet_name: receiptDetails.fleet_name,
    fleet_description: receiptDetails.fleet_description,
    fleet_features: receiptDetails.fleet_features,
    fleet_capacity: receiptDetails.fleet_capacity,
    fleet_image_url: receiptDetails.fleet_image_url,
    bus_id: receiptDetails.bus_id,
    receipt_status: receiptDetails.receipt_status || 'pending',
    branch_id: receiptDetails.branch_id
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Button variant="outline" onClick={goBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <UltraPremiumReceiptGenerator
        receiptData={receiptData}
        branchId={receiptDetails.branch_id}
        onDownload={() => {
          window.print();
        }}
      />
    </div>
  );
};

export default ReceiptPage;
