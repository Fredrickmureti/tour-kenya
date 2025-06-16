
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import ReceiptVerificationDialog from './receipt-verification/ReceiptVerificationDialog';
import { ReceiptFilters } from './receipt-management/ReceiptFilters';
import { ReceiptTable } from './receipt-management/ReceiptTable';
import { useReceiptData } from './receipt-management/useReceiptData';

const EnhancedReceiptManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | null>(null);
  
  const { data: receipts, isLoading, refetch, error } = useReceiptData();
  
  // Filter receipts
  const filteredReceipts = receipts?.filter(receipt => {
    const matchesSearch = !searchTerm || 
      receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.route_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || 
      receipt.receipt_status === statusFilter;
      
    const matchesPaymentStatus = !paymentStatusFilter || paymentStatusFilter === 'all' ||
      receipt.payment_status === paymentStatusFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  }) || [];

  const handleSignOffSuccess = () => {
    console.log('Sign-off successful, refetching data...');
    refetch();
  };

  if (error) {
    console.error('Receipt management error:', error);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Enhanced Receipt Management
              </CardTitle>
              <CardDescription>Manage, verify, and sign off receipts with advanced controls</CardDescription>
            </div>
            <ReceiptVerificationDialog />
          </div>
        </CardHeader>
        <CardContent>
          <ReceiptFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            paymentStatusFilter={paymentStatusFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onPaymentStatusFilterChange={setPaymentStatusFilter}
          />
          
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 border rounded-md bg-red-50 border-red-200">
              <Receipt className="h-16 w-16 mx-auto mb-4 text-red-300" />
              <p className="text-red-600 font-medium">Error loading receipts</p>
              <p className="text-sm text-gray-500 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-gray-50">
              <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground">No receipts found</p>
            </div>
          ) : (
            <ReceiptTable 
              receipts={filteredReceipts} 
              onSignOffSuccess={handleSignOffSuccess} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedReceiptManagement;
