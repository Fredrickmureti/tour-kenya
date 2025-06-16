
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, MapPin, CreditCard, User, Phone, Mail, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ReceiptData {
  receipt_number: string;
  passenger_name: string;
  passenger_phone?: string;
  passenger_email?: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  seat_numbers: string[];
  amount_paid: number;
  generated_at: string;
  branch_name: string;
  branch_address: string;
  receipt_id?: string;
  booking_id?: string;
  payment_method?: string;
  payment_status?: string;
}

interface ProfessionalReceiptGeneratorProps {
  receiptData: ReceiptData;
  onDownload?: () => void;
}

export const ProfessionalReceiptGenerator: React.FC<ProfessionalReceiptGeneratorProps> = ({ 
  receiptData, 
  onDownload 
}) => {
  const handlePrint = () => {
    window.print();
  };

  const qrCodeData = JSON.stringify({
    receipt_id: receiptData.receipt_id,
    receipt_number: receiptData.receipt_number,
    amount: receiptData.amount_paid,
    date: receiptData.generated_at
  });

  return (
    <div className="max-w-4xl mx-auto bg-white">
      <Card className="receipt-container shadow-none print:shadow-none print:border-none">
        {/* Header with Company Branding */}
        <CardHeader className="text-center border-b-2 border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 text-white print:bg-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold mb-2">
                RouteAura Bus Services
              </CardTitle>
              <p className="text-blue-100 text-lg">
                Your Trusted Travel Partner
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-lg mb-2">
                <QRCodeSVG 
                  value={qrCodeData} 
                  size={80}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-blue-100">Scan to Verify</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-500">
            <p className="text-xl font-semibold">OFFICIAL RECEIPT</p>
            <p className="text-blue-100">
              Receipt No: <span className="font-bold text-white">{receiptData.receipt_number}</span>
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Branch Information */}
          <div className="text-center bg-gray-50 p-6 rounded-lg border">
            <h3 className="font-bold text-xl text-gray-800 mb-2">{receiptData.branch_name}</h3>
            <p className="text-gray-600 text-lg">{receiptData.branch_address}</p>
            <div className="flex items-center justify-center mt-3">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">Authorized Service Provider</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Passenger Information */}
            <div className="space-y-4">
              <h4 className="font-bold text-xl text-gray-800 flex items-center border-b-2 border-gray-200 pb-2">
                <User className="h-6 w-6 mr-3 text-blue-600" />
                Passenger Details
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-20">Name:</span>
                  <span className="text-gray-900 text-lg">{receiptData.passenger_name}</span>
                </div>
                {receiptData.passenger_phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-900">{receiptData.passenger_phone}</span>
                  </div>
                )}
                {receiptData.passenger_email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-900">{receiptData.passenger_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Travel Information */}
            <div className="space-y-4">
              <h4 className="font-bold text-xl text-gray-800 flex items-center border-b-2 border-gray-200 pb-2">
                <Calendar className="h-6 w-6 mr-3 text-blue-600" />
                Travel Details
              </h4>
              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-24">Date:</span>
                  <span className="text-gray-900 text-lg">{receiptData.departure_date}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-24">Departure:</span>
                  <span className="text-gray-900">{receiptData.departure_time}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-24">Arrival:</span>
                  <span className="text-gray-900">{receiptData.arrival_time}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-24">Seats:</span>
                  <span className="text-gray-900 font-bold">{receiptData.seat_numbers.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Route Information - Full Width */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl text-gray-800 flex items-center mb-4">
              <MapPin className="h-6 w-6 mr-3 text-blue-600" />
              Journey Route
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="bg-blue-600 text-white p-4 rounded-lg shadow-md">
                  <p className="font-bold text-xl">{receiptData.from_location}</p>
                  <p className="text-blue-100 text-sm">Departure City</p>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="border-t-4 border-dashed border-gray-400 w-full mx-8 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-full border-2 border-gray-400">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="text-center flex-1">
                <div className="bg-green-600 text-white p-4 rounded-lg shadow-md">
                  <p className="font-bold text-xl">{receiptData.to_location}</p>
                  <p className="text-green-100 text-sm">Destination City</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
            <h4 className="font-bold text-xl text-gray-800 flex items-center mb-4">
              <CreditCard className="h-6 w-6 mr-3 text-green-600" />
              Payment Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Ticket Price:</span>
                  <span className="font-bold text-gray-900">KSh {receiptData.amount_paid.toLocaleString()}</span>
                </div>
                {receiptData.payment_method && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Payment Method:</span>
                    <span className="text-gray-900">{receiptData.payment_method}</span>
                  </div>
                )}
                {receiptData.payment_status && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Status:</span>
                    <span className={`font-bold ${
                      receiptData.payment_status === 'Paid' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {receiptData.payment_status}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    KSh {receiptData.amount_paid.toLocaleString()}
                  </p>
                  <p className="text-green-700 font-medium">Total Amount Paid</p>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Information */}
          <div className="bg-gray-100 p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {receiptData.receipt_id && (
                <div>
                  <span className="font-semibold text-gray-700">Receipt ID:</span>
                  <span className="text-gray-900 ml-2 font-mono">{receiptData.receipt_id}</span>
                </div>
              )}
              {receiptData.booking_id && (
                <div>
                  <span className="font-semibold text-gray-700">Booking ID:</span>
                  <span className="text-gray-900 ml-2 font-mono">{receiptData.booking_id}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">Generated:</span>
                <span className="text-gray-900 ml-2">{new Date(receiptData.generated_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t-2 border-gray-200 pt-6 space-y-2">
            <p className="font-semibold text-lg text-gray-800">Thank you for choosing RouteAura Bus Services!</p>
            <p>Keep this receipt for your records and present it during travel.</p>
            <p>For inquiries, please contact us with your receipt number.</p>
            <p className="text-xs text-gray-500 mt-4">
              This is an official receipt generated by RouteAura Bus Services booking system.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 print:hidden pt-6">
            <Button onClick={handlePrint} variant="outline" size="lg">
              Print Receipt
            </Button>
            {onDownload && (
              <Button onClick={onDownload} size="lg">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
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

export default ProfessionalReceiptGenerator;
