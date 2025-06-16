
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminOverview from '@/components/admin/AdminOverview';
import BookingsManagement from '@/components/admin/BookingsManagement';
import ManualBookingsManagement from '@/components/admin/ManualBookingsManagement';
import RescheduleRequestsManagement from '@/components/admin/RescheduleRequestsManagement';
import ReceiptsManagement from '@/components/admin/ReceiptsManagement';
import { ReceiptTemplateManagementTab } from '@/components/admin/ReceiptTemplateManagementTab';
import UsersManagement from '@/components/admin/UsersManagement';
import RoutesManagement from '@/components/admin/RoutesManagement';
import LocationsManagement from '@/components/admin/LocationsManagement';
import FleetManagement from '@/components/admin/FleetManagement';
import DriversManagement from '@/components/admin/DriversManagement';
import ReviewsManagement from '@/components/admin/ReviewsManagement';
import InboxManagement from '@/components/admin/InboxManagement';
import FAQManagement from '@/components/admin/FAQManagement';
import BranchManagement from '@/components/admin/BranchManagement';
import DataExportManager from '@/components/admin/DataExportManager';
import AdminUsersManagement from '@/components/admin/AdminUsersManagement';
import OfficesManagement from '@/components/admin/OfficesManagement';
import BusScheduleManagement from '@/components/admin/BusScheduleManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import SiteSettingsManagement from '@/components/admin/SiteSettingsManagement';
import { useBranch } from '@/contexts/BranchContext';
import { Navigate } from 'react-router-dom';
import BlogManagementPage from '@/pages/admin/BlogManagementPage';
import BlogPostEditorPage from '@/pages/admin/BlogPostEditorPage';
import GalleryManagementPage from '@/pages/admin/GalleryManagementPage';

const AdminDashboard: React.FC = () => {
  const { isSuperAdmin } = useBranch();

  return (
    <div className="flex-1">
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="bookings" element={<BookingsManagement />} />
        <Route path="manual-bookings" element={<ManualBookingsManagement />} />
        <Route path="reschedule-requests" element={<RescheduleRequestsManagement />} />
        <Route path="receipts" element={<ReceiptsManagement />} />
        <Route path="receipt-templates" element={<ReceiptTemplateManagementTab />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="routes" element={<RoutesManagement />} />
        <Route path="locations" element={<LocationsManagement />} />
        <Route path="fleet" element={<FleetManagement />} />
        <Route path="bus-schedules" element={<BusScheduleManagement />} />
        <Route path="drivers" element={<DriversManagement />} />
        <Route path="reviews" element={<ReviewsManagement />} />
        <Route path="messages" element={<InboxManagement />} />
        <Route path="faqs" element={<FAQManagement />} />
        <Route path="offices" element={<OfficesManagement />} />
        <Route path="blog" element={<BlogManagementPage />} />
        <Route path="blog/new" element={<BlogPostEditorPage />} />
        <Route path="blog/edit/:postId" element={<BlogPostEditorPage />} />
        <Route path="gallery" element={<GalleryManagementPage />} />
        
        {/* Superadmin only routes */}
        <Route 
          path="branches" 
          element={isSuperAdmin ? <BranchManagement /> : <Navigate to="/route-aura-booking-admin-page/dashboard" replace />} 
        />
        <Route 
          path="content-management" 
          element={isSuperAdmin ? <ContentManagement /> : <Navigate to="/route-aura-booking-admin-page/dashboard" replace />} 
        />
        <Route 
          path="site-settings" 
          element={isSuperAdmin ? <SiteSettingsManagement /> : <Navigate to="/route-aura-booking-admin-page/dashboard" replace />} 
        />
        <Route 
          path="data-management" 
          element={isSuperAdmin ? <DataExportManager /> : <Navigate to="/route-aura-booking-admin-page/dashboard" replace />} 
        />
        <Route 
          path="admin-users" 
          element={isSuperAdmin ? <AdminUsersManagement /> : <Navigate to="/route-aura-booking-admin-page/dashboard" replace />} 
        />
      </Routes>
    </div>
  );
};

export default AdminDashboard;
