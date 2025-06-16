
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BranchContextType {
  currentBranch: Branch | null | 'all';
  setCurrentBranch: (branch: Branch | null | 'all') => void;
  switchBranch: (branchId: string | null) => void;
  isSuperAdmin: boolean;
  isLoading: boolean;
  branches: Branch[];
  getCurrentBranchFilter: () => string | null;
  adminRole: string | null;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

interface BranchProviderProps {
  children: ReactNode;
}

export const BranchProvider: React.FC<BranchProviderProps> = ({ children }) => {
  const { adminUser, isLoading: authLoading } = useAdminAuth();
  const [currentBranch, setCurrentBranch] = useState<Branch | null | 'all'>(null);

  // Get admin role and superadmin status directly from auth context
  const isSuperAdmin = adminUser?.role === 'superadmin';
  const adminRole = adminUser?.role || null;

  // Fetch all branches
  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async (): Promise<Branch[]> => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!adminUser,
  });

  // Set initial branch based on admin role
  useEffect(() => {
    if (!adminUser || authLoading) return;

    if (isSuperAdmin) {
      // Superadmin: default to "all" branches
      setCurrentBranch('all');
    } else if (adminUser.branchId && branches) {
      // Branch admin: get their specific branch
      const userBranch = branches.find(b => b.id === adminUser.branchId);
      if (userBranch) {
        setCurrentBranch(userBranch);
      }
    }
  }, [adminUser, authLoading, branches, isSuperAdmin]);

  // Switch branch function for superadmin
  const switchBranch = (branchId: string | null) => {
    if (!isSuperAdmin) return;
    
    if (branchId === null) {
      setCurrentBranch('all');
    } else {
      const branch = branches?.find(b => b.id === branchId);
      if (branch) {
        setCurrentBranch(branch);
      }
    }
  };

  // Get current branch filter for queries
  const getCurrentBranchFilter = (): string | null => {
    if (isSuperAdmin && currentBranch === 'all') {
      return null; // No filter for superadmin viewing all branches
    }
    
    if (currentBranch && typeof currentBranch === 'object') {
      return currentBranch.id;
    }
    
    return null;
  };

  const isLoading = authLoading || branchesLoading;

  const value: BranchContextType = {
    currentBranch,
    setCurrentBranch,
    switchBranch,
    isSuperAdmin,
    isLoading,
    branches: branches || [],
    getCurrentBranchFilter,
    adminRole,
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = (): BranchContextType => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};
