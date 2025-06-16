
import React from 'react';
import { Button } from '@/components/ui/button';
import { Receipt, RefreshCw } from 'lucide-react';

interface ReceiptErrorProps {
  error: Error | null;
  onRetry: () => void;
}

export const ReceiptError: React.FC<ReceiptErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="text-center py-8 border rounded-md bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
      <Receipt className="h-12 w-12 text-red-400 mx-auto mb-4" />
      <p className="text-red-600 dark:text-red-400 font-medium">Error loading receipts</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
      <Button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center mx-auto"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  );
};
