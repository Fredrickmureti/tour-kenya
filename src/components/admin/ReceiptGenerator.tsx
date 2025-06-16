
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, MapPin, CreditCard, User, Phone, Mail } from 'lucide-react';

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
}

interface ReceiptGeneratorProps {
  receiptData: ReceiptData;
  onDownload?: () => void;
}

export const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ 
  receiptData, 
  onDownload 
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="receipt-container shadow-none print:shadow-none print:border-none">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl font-bold text-primary">
            Bus Travel Receipt
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Receipt No: {receiptData.receipt_number}
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Branch Information */}
          <div className="text-center border-b pb-4">
            <h3 className="font-semibold text-lg">{receiptData.branch_name}</h3>
            <p className="text-sm text-muted-foreground">{receiptData.branch_address}</p>
          </div>

          {/* Passenger Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center">
                <User className="h-4 w-4 mr-2" />
                Passenger Details
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {receiptData.passenger_name}</p>
                {receiptData.passenger_phone && (
                  <p className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {receiptData.passenger_phone}
                  </p>
                )}
                {receiptData.passenger_email && (
                  <p className="flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {receiptData.passenger_email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Travel Details
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Date:</span> {receiptData.departure_date}</p>
                <p><span className="font-medium">Departure:</span> {receiptData.departure_time}</p>
                <p><span className="font-medium">Arrival:</span> {receiptData.arrival_time}</p>
                <p><span className="font-medium">Seats:</span> {receiptData.seat_numbers.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold flex items-center mb-3">
              <MapPin className="h-4 w-4 mr-2" />
              Route Information
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="font-medium">{receiptData.from_location}</p>
                <p className="text-xs text-muted-foreground">From</p>
              </div>
              <div className="flex-1 border-t border-dashed mx-4"></div>
              <div className="text-center">
                <p className="font-medium">{receiptData.to_location}</p>
                <p className="text-xs text-muted-foreground">To</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold flex items-center mb-2">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Information
            </h4>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total Amount Paid:</span>
              <span className="text-2xl font-bold text-green-600">
                KSh {receiptData.amount_paid.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            <p>Generated on: {new Date(receiptData.generated_at).toLocaleString()}</p>
            <p className="mt-2">Thank you for choosing our services!</p>
            <p>Keep this receipt for your records.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 print:hidden">
            <Button onClick={handlePrint} variant="outline">
              Download PDF
            </Button>
            {onDownload && (
              <Button onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Save Receipt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptGenerator;
