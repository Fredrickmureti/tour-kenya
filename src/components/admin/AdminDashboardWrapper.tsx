
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { BranchProvider } from '@/contexts/BranchContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboard from '@/pages/admin/AdminDashboard';

const AdminDashboardWrapper: React.FC = () => {
  return (
    <BranchProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <AdminHeader />
            <main className="flex-1">
              <AdminDashboard />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </BranchProvider>
  );
};

export default AdminDashboardWrapper;
