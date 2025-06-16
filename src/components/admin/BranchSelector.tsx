
import React from 'react';
import { useBranch } from '@/contexts/BranchContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building } from 'lucide-react';

const BranchSelector = () => {
  const { currentBranch, branches, isSuperAdmin, switchBranch, isLoading } = useBranch();

  if (isLoading) {
    return <div className="h-10 w-[200px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
          {currentBranch && typeof currentBranch === 'object' ? currentBranch.name : 'Loading Branch...'}
        </span>
      </div>
    );
  }

  const getCurrentValue = () => {
    if (currentBranch === 'all') return 'all';
    if (currentBranch && typeof currentBranch === 'object') return currentBranch.id;
    return 'all';
  };

  return (
    <div className="flex items-center space-x-2">
      <Building className="h-4 w-4 text-gray-600 dark:text-gray-400 hidden sm:block" />
      <Select
        value={getCurrentValue()}
        onValueChange={(value) => {
          if (value === 'all') {
            switchBranch(null);
          } else {
            switchBranch(value);
          }
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px] sm:w-[200px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
          <SelectValue placeholder="Select Branch" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <SelectItem value="all" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="flex flex-col">
              <span className="font-medium">All Branches</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">View data across all locations</span>
            </div>
          </SelectItem>
          {branches?.map((branch) => (
            <SelectItem key={branch.id} value={branch.id} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex flex-col">
                <span className="font-medium">{branch.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{branch.city}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BranchSelector;
