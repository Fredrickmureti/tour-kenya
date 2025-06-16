import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, Crown, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import BranchSelector from './BranchSelector';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const AdminHeader = () => {
  const { adminUser, logoutAdmin } = useAdminAuth();
  const { isSuperAdmin, currentBranch } = useBranch();
  const navigate = useNavigate();
  const { data: siteSettings } = useSiteSettings();

  const handleSignOut = async () => {
    await logoutAdmin();
    navigate('/route-aura-booking-admin-page');
  };

  const getBranchDisplayName = () => {
    if (isSuperAdmin && currentBranch === 'all') return 'All Branches';
    if (currentBranch && typeof currentBranch === 'object') return currentBranch.name;
    return 'Unknown Branch';
  };

  const visitMainSite = () => {
    window.open('/', '_blank');
  };

  const companyName = siteSettings?.branding?.company_name || 'Route Aura';

  return (
    <header className="border-b bg-white dark:bg-gray-900 px-6 py-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isSuperAdmin ? `${companyName} Superadmin` : 'Admin Dashboard'}
              </h1>
              {isSuperAdmin && (
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Superadmin
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              {isSuperAdmin ? `Managing: ${getBranchDisplayName()}` : `Branch: ${getBranchDisplayName()}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Branch Selector for Superadmins */}
          {isSuperAdmin && (
            <div className="hidden md:block">
              <BranchSelector />
            </div>
          )}
          
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{adminUser?.email}</p>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {isSuperAdmin ? 'Super Administrator' : 'Branch Administrator'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={visitMainSite}
              className="dark:text-gray-300 dark:hover:text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Main Site
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="dark:text-gray-300 dark:hover:text-white">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
