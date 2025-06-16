
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminOverview from './AdminOverview';
import BookingsManagement from './BookingsManagement';
import UsersManagement from './UsersManagement';
import RoutesManagement from './RoutesManagement';
import FleetManagement from './FleetManagement';
import LocationsManagement from './LocationsManagement';
import ReceiptsManagement from './ReceiptsManagement';
import BranchManagement from './BranchManagement';
import DriversManagement from './DriversManagement';
import ReviewsManagement from './ReviewsManagement';
import FAQManagement from './FAQManagement';
import InboxManagement from './InboxManagement';
import RescheduleRequestsManagement from './RescheduleRequestsManagement';
import BusScheduleManagement from './BusScheduleManagement';
import ManualBookingsManagement from './ManualBookingsManagement';
import DataExportManager from './DataExportManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import OfficesManagement from './OfficesManagement';
import BookingLogsManagement from './BookingLogsManagement';
import { ReceiptTemplateManagementTab } from './ReceiptTemplateManagementTab';
import BlogManagementPage from '@/pages/admin/BlogManagementPage';
import BlogPostEditorPage from '@/pages/admin/BlogPostEditorPage';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/bookings" element={<BookingsManagement />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/routes" element={<RoutesManagement />} />
            <Route path="/fleet" element={<FleetManagement />} />
            <Route path="/locations" element={<LocationsManagement />} />
            <Route path="/receipts" element={<ReceiptsManagement />} />
            <Route path="/receipt-templates" element={<ReceiptTemplateManagementTab />} />
            <Route path="/branches" element={<BranchManagement />} />
            <Route path="/drivers" element={<DriversManagement />} />
            <Route path="/reviews" element={<ReviewsManagement />} />
            <Route path="/faq" element={<FAQManagement />} />
            <Route path="/inbox" element={<InboxManagement />} />
            <Route path="/reschedule-requests" element={<RescheduleRequestsManagement />} />
            <Route path="/schedules" element={<BusScheduleManagement />} />
            <Route path="/manual-bookings" element={<ManualBookingsManagement />} />
            <Route path="/data-export" element={<DataExportManager />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/offices" element={<OfficesManagement />} />
            <Route path="/booking-logs" element={<BookingLogsManagement />} />
            <Route path="/blog" element={<BlogManagementPage />} />
            <Route path="/blog/new" element={<BlogPostEditorPage />} />
            <Route path="/blog/edit/:postId" element={<BlogPostEditorPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
