
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Printer, QrCode, CheckCircle, Clock, MapPin, User, CreditCard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface AdminReceiptData {
  receipt_id: string;
  receipt_number: string;
  booking_id: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  route_name: string;
  departure_location_name: string;
  arrival_location_name: string;
  departure_time: string;
  price: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  branch_name: string;
  branch_address: string;
  seat_numbers: string[];
}

interface AdminReceiptViewerProps {
  receiptId: string;
  onBack: () => void;
}

export const AdminReceiptViewer: React.FC<AdminReceiptViewerProps> = ({ receiptId, onBack }) => {
  const [receiptData, setReceiptData] = useState<AdminReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceiptData = async () => {
      try {
        const { data, error } = await supabase.rpc('get_receipt_details', { p_receipt_id: receiptId });

        if (error) throw error;

        if (data && typeof data === 'object') {
          const receipt = data as unknown as AdminReceiptData;
          setReceiptData(receipt);
        } else {
          setError('Receipt not found');
        }
      } catch (err: any) {
        console.error('Error fetching receipt:', err);
        setError(err.message || 'Failed to fetch receipt details');
        toast.error('Failed to load receipt details');
      } finally {
        setIsLoading(false);
      }
    };

    if (receiptId) {
      fetchReceiptData();
    }
  }, [receiptId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Simple download implementation - can be enhanced with proper PDF generation
    const receiptContent = `
Receipt Number: ${receiptData?.receipt_number}
Passenger: ${receiptData?.user_name}
Route: ${receiptData?.route_name}
Amount: KES ${receiptData?.price}
Payment Status: ${receiptData?.payment_status}
Date: ${receiptData?.created_at ? new Date(receiptData.created_at).toLocaleDateString() : 'N/A'}
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData?.receipt_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded successfully');
  };

  const qrCodeData = receiptData ? JSON.stringify({
    receipt_id: receiptData.receipt_id,
    receipt_number: receiptData.receipt_number,
    amount: receiptData.price,
    date: receiptData.created_at
  }) : '';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !receiptData) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white">Receipt Not Found</CardTitle>
            <Button variant="outline" onClick={onBack} className="dark:border-gray-600 dark:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 dark:text-red-400">{error || 'Receipt not found'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="dark:border-gray-600 dark:text-gray-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Receipts
        </Button>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint} className="dark:border-gray-600 dark:text-gray-300">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <Card className="receipt-container bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center border-b-2 border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 text-white print:bg-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold mb-2">
                RouteAura Bus Services
              </CardTitle>
              <p className="text-blue-100">
                Your Trusted Travel Partner
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-lg mb-2">
                <QRCodeSVG 
                  value={qrCodeData} 
                  size={60}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-blue-100">Scan to Verify</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-500">
            <p className="text-lg font-semibold">OFFICIAL RECEIPT</p>
            <p className="text-blue-100">
              Receipt No: <span className="font-bold text-white">{receiptData.receipt_number}</span>
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Branch Information */}
          <div className="text-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">{receiptData.branch_name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{receiptData.branch_address}</p>
            <div className="flex items-center justify-center mt-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-700 dark:text-green-300 text-sm font-medium">Authorized Service Provider</span>
            </div>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Passenger Information */}
            <div className="space-y-3">
              <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center border-b-2 border-gray-200 dark:border-gray-600 pb-2">
                <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Passenger Details
              </h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 w-16">Name:</span>
                  <span className="text-gray-900 dark:text-gray-100">{receiptData.user_name}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 w-16">Phone:</span>
                  <span className="text-gray-900 dark:text-gray-100">{receiptData.user_phone || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 w-16">Email:</span>
                  <span className="text-gray-900 dark:text-gray-100 text-sm">{receiptData.user_email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Travel Information */}
            <div className="space-y-3">
              <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center border-b-2 border-gray-200 dark:border-gray-600 pb-2">
                <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Travel Details
              </h4>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2 border border-green-200 dark:border-green-800">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 w-20">Date:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {receiptData.departure_time ? new Date(receiptData.departure_time).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 w-20">Time:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {receiptData.departure_time ? new Date(receiptData.departure_time).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 w-20">Seats:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-bold">{receiptData.seat_numbers?.join(', ') || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600">
            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center mb-3">
              <MapPin className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Journey Route
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="bg-blue-600 text-white p-3 rounded-lg shadow-md">
                  <p className="font-bold">{receiptData.departure_location_name}</p>
                  <p className="text-blue-100 text-xs">Departure</p>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="border-t-2 border-dashed border-gray-400 dark:border-gray-500 w-full mx-4"></div>
              </div>
              <div className="text-center flex-1">
                <div className="bg-green-600 text-white p-3 rounded-lg shadow-md">
                  <p className="font-bold">{receiptData.arrival_location_name}</p>
                  <p className="text-green-100 text-xs">Destination</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center mb-3">
              <CreditCard className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              Payment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Amount Paid:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">KES {receiptData.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Payment Method:</span>
                  <span className="text-gray-900 dark:text-gray-100">{receiptData.payment_method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Status:</span>
                  <Badge variant={receiptData.payment_status === 'Paid' ? 'default' : 'secondary'}>
                    {receiptData.payment_status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    KES {receiptData.price?.toLocaleString()}
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">Total Paid</p>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Metadata */}
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Receipt ID:</span>
                <span className="text-gray-900 dark:text-gray-100 ml-2 font-mono text-xs">{receiptData.receipt_id}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Booking ID:</span>
                <span className="text-gray-900 dark:text-gray-100 ml-2 font-mono text-xs">{receiptData.booking_id}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Generated:</span>
                <span className="text-gray-900 dark:text-gray-100 ml-2">
                  {receiptData.created_at ? new Date(receiptData.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 border-t-2 border-gray-200 dark:border-gray-600 pt-4 space-y-1">
            <p className="font-semibold text-gray-800 dark:text-gray-200">Thank you for choosing RouteAura Bus Services!</p>
            <p>Keep this receipt for your records and present it during travel.</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              This is an official receipt generated by RouteAura Bus Services booking system.
            </p>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-container, .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 0.5in;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminReceiptViewer;
