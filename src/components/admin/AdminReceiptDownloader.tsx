
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminReceiptDownloaderProps {
  receiptId: string;
  variant?: 'download' | 'print' | 'both';
  size?: 'sm' | 'default' | 'lg';
}

interface ReceiptDetailsResponse {
  receipt_number: string;
  created_at: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  route_name: string;
  departure_location_name: string;
  arrival_location_name: string;
  departure_time: string;
  seat_numbers: string[];
  price: number;
  payment_method: string;
  payment_status: string;
  branch_name: string;
  branch_address: string;
}

export const AdminReceiptDownloader: React.FC<AdminReceiptDownloaderProps> = ({ 
  receiptId, 
  variant = 'download',
  size = 'sm'
}) => {
  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.rpc('get_receipt_details', { 
        p_receipt_id: receiptId 
      });

      if (error) throw error;
      if (!data) throw new Error('Receipt not found');

      // Safely cast the data with proper type checking
      const receiptData = data as unknown as ReceiptDetailsResponse;
      const receiptContent = generateReceiptContent(receiptData);
      
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptData.receipt_number}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const handlePrint = async () => {
    try {
      const { data, error } = await supabase.rpc('get_receipt_details', { 
        p_receipt_id: receiptId 
      });

      if (error) throw error;
      if (!data) throw new Error('Receipt not found');

      // Safely cast the data with proper type checking
      const receiptData = data as unknown as ReceiptDetailsResponse;
      const receiptContent = generateReceiptContent(receiptData);
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt ${receiptData.receipt_number}</title>
              <style>
                body { font-family: monospace; white-space: pre-wrap; margin: 20px; }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>${receiptContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      
      toast.success('Receipt opened for printing');
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast.error('Failed to print receipt');
    }
  };

  const generateReceiptContent = (data: ReceiptDetailsResponse) => {
    return `
ROUTEAURA BUS SERVICES
OFFICIAL RECEIPT
========================

Receipt Number: ${data.receipt_number}
Date: ${new Date(data.created_at).toLocaleDateString()}
Time: ${new Date(data.created_at).toLocaleTimeString()}

PASSENGER DETAILS
Passenger: ${data.user_name}
Phone: ${data.user_phone || 'N/A'}
Email: ${data.user_email || 'N/A'}

JOURNEY DETAILS
Route: ${data.route_name}
From: ${data.departure_location_name}
To: ${data.arrival_location_name}
Departure: ${new Date(data.departure_time).toLocaleString()}
Seats: ${data.seat_numbers?.join(', ') || 'N/A'}

PAYMENT DETAILS
Amount: KES ${data.price?.toLocaleString()}
Payment Method: ${data.payment_method}
Payment Status: ${data.payment_status}

BRANCH INFORMATION
Branch: ${data.branch_name}
Address: ${data.branch_address}

========================
Thank you for choosing RouteAura Bus Services!
Keep this receipt for your records.
`;
  };

  if (variant === 'both') {
    return (
      <div className="flex space-x-1">
        <Button
          size={size}
          variant="outline"
          onClick={handleDownload}
          className="dark:border-gray-600 dark:text-gray-300 dark:hover:text-white"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        <Button
          size={size}
          variant="outline"
          onClick={handlePrint}
          className="dark:border-gray-600 dark:text-gray-300 dark:hover:text-white"
        >
          <Printer className="h-4 w-4 mr-1" />
          Print
        </Button>
      </div>
    );
  }

  return (
    <Button
      size={size}
      variant="outline"
      onClick={variant === 'print' ? handlePrint : handleDownload}
      className="dark:border-gray-600 dark:text-gray-300 dark:hover:text-white"
    >
      {variant === 'print' ? (
        <>
          <Printer className="h-4 w-4 mr-1" />
          Print
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-1" />
          Download
        </>
      )}
    </Button>
  );
};

export default AdminReceiptDownloader;
