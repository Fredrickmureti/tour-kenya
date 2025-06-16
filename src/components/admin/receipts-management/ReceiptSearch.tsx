
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ReceiptSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ReceiptSearch: React.FC<ReceiptSearchProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      <Input
        placeholder="Search receipts..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
      />
    </div>
  );
};
