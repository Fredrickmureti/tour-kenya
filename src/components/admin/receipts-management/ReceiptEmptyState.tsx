
import React from 'react';
import { Receipt } from 'lucide-react';

export const ReceiptEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <Receipt className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
      <p className="text-muted-foreground dark:text-gray-400">No receipts found.</p>
    </div>
  );
};
