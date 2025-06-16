
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import AdminReceiptDialog from '../AdminReceiptDialog';
import AdminReceiptDownloader from '../AdminReceiptDownloader';

interface ReceiptData {
  receipt_id: string;
  receipt_number: string;
  booking_id: string;
  passenger_name: string;
  passenger_phone: string;
  route_name: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  generated_at: string;
  branch_name: string;
}

interface ReceiptsTableProps {
  receipts: ReceiptData[];
  isSuperAdmin: boolean;
}

export const ReceiptsTable: React.FC<ReceiptsTableProps> = ({ 
  receipts, 
  isSuperAdmin 
}) => {
  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="border rounded-md overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-700">
            <TableHead className="text-gray-900 dark:text-gray-100">Receipt Number</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100">Passenger</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100">Route</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100">Amount</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100">Payment Status</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100">Date</TableHead>
            {isSuperAdmin && <TableHead className="text-gray-900 dark:text-gray-100">Branch</TableHead>}
            <TableHead className="text-gray-900 dark:text-gray-100">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => (
            <TableRow key={receipt.receipt_id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <TableCell>
                <div className="font-medium text-gray-900 dark:text-gray-100">{receipt.receipt_number}</div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{receipt.passenger_name}</div>
                  <div className="text-xs text-muted-foreground dark:text-gray-400">{receipt.passenger_phone}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium text-gray-900 dark:text-gray-100">{receipt.route_name}</div>
              </TableCell>
              <TableCell>
                <span className="font-medium text-gray-900 dark:text-gray-100">KES {receipt.amount?.toFixed(2)}</span>
              </TableCell>
              <TableCell>
                <Badge className={getPaymentStatusColor(receipt.payment_status)}>
                  {receipt.payment_status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(receipt.generated_at).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground dark:text-gray-400">
                  {new Date(receipt.generated_at).toLocaleTimeString()}
                </div>
              </TableCell>
              {isSuperAdmin && (
                <TableCell className="text-gray-900 dark:text-gray-100">{receipt.branch_name}</TableCell>
              )}
              <TableCell>
                <div className="flex space-x-2">
                  <AdminReceiptDialog receiptId={receipt.receipt_id}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="dark:border-gray-600 dark:text-gray-300 dark:hover:text-white"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </AdminReceiptDialog>
                  <AdminReceiptDownloader 
                    receiptId={receipt.receipt_id}
                    variant="download"
                    size="sm"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
