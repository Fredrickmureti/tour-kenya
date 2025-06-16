
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { ReceiptStatistics } from './receipts-management/ReceiptStatistics';
import { ReceiptSearch } from './receipts-management/ReceiptSearch';
import { ReceiptsTable } from './receipts-management/ReceiptsTable';
import { ReceiptError } from './receipts-management/ReceiptError';
import { ReceiptLoading } from './receipts-management/ReceiptLoading';
import { ReceiptEmptyState } from './receipts-management/ReceiptEmptyState';
import { useReceiptsManagement } from './receipts-management/useReceiptsManagement';

const ReceiptsManagement = () => {
  const { isSuperAdmin, currentBranch } = useBranch();
  const {
    receipts,
    filteredReceipts,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    handleRetry
  } = useReceiptsManagement();

  const getBranchDisplayName = () => {
    if (currentBranch === 'all') return 'All Branches';
    if (currentBranch && typeof currentBranch === 'object') return currentBranch.name;
    return 'Unknown Branch';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Receipt className="h-5 w-5 mr-2" />
                Receipts Management
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                View and manage receipts for {getBranchDisplayName()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ReceiptStatistics receipts={receipts} />
          <ReceiptSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          {isLoading ? (
            <ReceiptLoading />
          ) : error ? (
            <ReceiptError error={error} onRetry={handleRetry} />
          ) : filteredReceipts.length === 0 ? (
            <ReceiptEmptyState />
          ) : (
            <ReceiptsTable receipts={filteredReceipts} isSuperAdmin={isSuperAdmin} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptsManagement;
