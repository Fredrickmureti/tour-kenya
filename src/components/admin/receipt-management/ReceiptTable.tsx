
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle } from 'lucide-react';
import AdminReceiptDialog from '../AdminReceiptDialog';
import AdminReceiptDownloader from '../AdminReceiptDownloader';
import { ReceiptSignOffDialog } from '../receipt-verification/ReceiptSignOffDialog';
import { EnhancedReceipt } from './types';

interface ReceiptTableProps {
  receipts: EnhancedReceipt[];
  onSignOffSuccess: () => void;
}

export const ReceiptTable: React.FC<ReceiptTableProps> = ({ receipts, onSignOffSuccess }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'signed_off':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  console.log('ReceiptTable rendering with receipts:', receipts);

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt #</TableHead>
            <TableHead>Passenger</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt: EnhancedReceipt) => {
            console.log('Processing receipt:', receipt.receipt_id, 'is_signed_off:', receipt.is_signed_off);
            
            return (
              <TableRow key={receipt.receipt_id}>
                <TableCell className="font-mono text-sm">
                  {receipt.receipt_number}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{receipt.passenger_name}</div>
                    <div className="text-sm text-gray-500">{receipt.passenger_phone}</div>
                  </div>
                </TableCell>
                <TableCell>{receipt.route_name}</TableCell>
                <TableCell className="font-bold text-green-600">
                  KSh {receipt.amount?.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge className={getPaymentStatusColor(receipt.payment_status)}>
                    {receipt.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(receipt.receipt_status || 'pending')}>
                      {receipt.receipt_status?.charAt(0).toUpperCase() + receipt.receipt_status?.slice(1) || 'Pending'}
                    </Badge>
                    {receipt.is_signed_off && (
                      <div className="flex items-center text-green-600 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Signed
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatDate(receipt.generated_at)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <AdminReceiptDialog receiptId={receipt.receipt_id}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </AdminReceiptDialog>
                    
                    <AdminReceiptDownloader
                      receiptId={receipt.receipt_id}
                      variant="download"
                      size="sm"
                    />
                    
                    <ReceiptSignOffDialog
                      receiptId={receipt.receipt_id}
                      receiptNumber={receipt.receipt_number}
                      isAlreadySignedOff={receipt.is_signed_off || false}
                      onSignOffSuccess={onSignOffSuccess}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
