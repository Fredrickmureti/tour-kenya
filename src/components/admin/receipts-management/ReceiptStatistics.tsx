
import React from 'react';
import { Receipt, Download, Eye } from 'lucide-react';

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

interface ReceiptStatisticsProps {
  receipts: ReceiptData[] | undefined;
}

export const ReceiptStatistics: React.FC<ReceiptStatisticsProps> = ({ receipts }) => {
  const totalReceipts = receipts?.length || 0;
  const totalRevenue = receipts?.reduce((sum, receipt) => sum + receipt.amount, 0) || 0;
  const paidReceipts = receipts?.filter(r => r.payment_status === 'Paid')?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center">
          <Receipt className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Receipts</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalReceipts}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center">
          <Download className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">KES {totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="flex items-center">
          <Eye className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Paid Receipts</p>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{paidReceipts}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
