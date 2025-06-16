
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Route, 
  MapPin, 
  Truck, 
  UserCheck, 
  MessageSquare, 
  HelpCircle, 
  Building, 
  Receipt, 
  FileSpreadsheet,
  UserPlus,
  Building2,
  Bus,
  Clock,
  FileText,
  Edit3,
  Palette,
  Image,
} from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { isSuperAdmin } = useBranch();

  const menuItems = [
    { to: '/route-aura-booking-admin-page/dashboard', icon: Calendar, label: 'Overview' },
    { to: '/route-aura-booking-admin-page/dashboard/bookings', icon: Calendar, label: 'Bookings' },
    { to: '/route-aura-booking-admin-page/dashboard/manual-bookings', icon: UserPlus, label: 'Manual Bookings' },
    { to: '/route-aura-booking-admin-page/dashboard/reschedule-requests', icon: Clock, label: 'Reschedule Requests' },
    { to: '/route-aura-booking-admin-page/dashboard/receipts', icon: Receipt, label: 'Receipts' },
    { to: '/route-aura-booking-admin-page/dashboard/receipt-templates', icon: FileText, label: 'Receipt Templates' },
    { to: '/route-aura-booking-admin-page/dashboard/users', icon: Users, label: 'Users' },
    { to: '/route-aura-booking-admin-page/dashboard/routes', icon: Route, label: 'Routes' },
    { to: '/route-aura-booking-admin-page/dashboard/locations', icon: MapPin, label: 'Locations' },
    { to: '/route-aura-booking-admin-page/dashboard/fleet', icon: Truck, label: 'Fleet' },
    { to: '/route-aura-booking-admin-page/dashboard/bus-schedules', icon: Bus, label: 'Bus Schedules' },
    { to: '/route-aura-booking-admin-page/dashboard/drivers', icon: UserCheck, label: 'Drivers' },
    { to: '/route-aura-booking-admin-page/dashboard/reviews', icon: MessageSquare, label: 'Reviews' },
    { to: '/route-aura-booking-admin-page/dashboard/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/route-aura-booking-admin-page/dashboard/faqs', icon: HelpCircle, label: 'FAQs' },
    { to: '/route-aura-booking-admin-page/dashboard/blog', icon: FileText, label: 'Blog' },
    { to: '/route-aura-booking-admin-page/dashboard/gallery', icon: Image, label: 'Gallery' },
    { to: '/route-aura-booking-admin-page/dashboard/offices', icon: Building2, label: 'Offices' },
  ];

  const superAdminItems = [
    { to: '/route-aura-booking-admin-page/dashboard/branches', icon: Building, label: 'Branches' },
    { to: '/route-aura-booking-admin-page/dashboard/content-management', icon: Edit3, label: 'Content Management' },
    { to: '/route-aura-booking-admin-page/dashboard/data-management', icon: FileSpreadsheet, label: 'Data Management' },
    { to: '/route-aura-booking-admin-page/dashboard/admin-users', icon: UserPlus, label: 'Admin Users' },
    { to: '/route-aura-booking-admin-page/dashboard/site-settings', icon: Palette, label: 'Site Settings' },
  ];

  return (
    <Sidebar variant="sidebar" className="border-r" collapsible="icon">
      <SidebarHeader className="p-4">
        <h2 className="font-bold text-lg">Admin Panel</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.to} tooltip={item.label}>
                    <Link to={item.to}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {superAdminItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.to)} tooltip={item.label}>
                      <Link to={item.to}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
