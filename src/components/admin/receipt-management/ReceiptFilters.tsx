
import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ReceiptFiltersProps {
  searchTerm: string;
  statusFilter: string | null;
  paymentStatusFilter: string | null;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string | null) => void;
  onPaymentStatusFilterChange: (value: string | null) => void;
}

export const ReceiptFilters: React.FC<ReceiptFiltersProps> = ({
  searchTerm,
  statusFilter,
  paymentStatusFilter,
  onSearchChange,
  onStatusFilterChange,
  onPaymentStatusFilterChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search receipts, passenger name, or route..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <Select value={statusFilter || ''} onValueChange={(value) => onStatusFilterChange(value || null)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Receipt Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="signed_off">Signed Off</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select value={paymentStatusFilter || ''} onValueChange={(value) => onPaymentStatusFilterChange(value || null)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payments</SelectItem>
          <SelectItem value="Paid">Paid</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Failed">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
