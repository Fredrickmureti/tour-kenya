import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Home,
  LayoutDashboard,
  Settings,
  Users,
  Building2,
  LogOut,
  Menu,
  Receipt,
  MapPin,
  Car
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AdminNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutAdmin } = useAdminAuth();

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await logoutAdmin();
    navigate('/route-aura-booking-admin-page');
  };

  const navigationItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/route-aura-booking-admin-page/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Bookings',
      href: '/route-aura-booking-admin-page/dashboard/bookings',
      icon: Home,
    },
    {
      name: 'Manual Bookings',
      href: '/route-aura-booking-admin-page/dashboard/manual-bookings',
      icon: Building2,
    },
    {
      name: 'Users',
      href: '/route-aura-booking-admin-page/dashboard/users',
      icon: Users,
    },
    {
      name: 'Drivers',
      href: '/route-aura-booking-admin-page/dashboard/drivers',
      icon: Car,
    },
    {
      name: 'Receipts',
      href: '/route-aura-booking-admin-page/dashboard/receipts',
      icon: Receipt,
    },
    {
      name: 'Branch Settings',
      href: '/route-aura-booking-admin-page/dashboard/branch-settings',
      icon: MapPin,
    },
    {
      name: 'Settings',
      href: '/route-aura-booking-admin-page/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="border-r flex flex-col h-full bg-secondary">
      <div className="px-4 py-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="p-4">
              <SheetHeader>
                <SheetTitle>Admin Navigation</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                {navigationItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      "w-full h-9 p-2 justify-start font-normal hover:bg-accent hover:text-accent-foreground rounded-md",
                      isActive(item.href) ? "bg-accent text-accent-foreground" : ""
                    )}
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full h-9 p-2 justify-start font-normal hover:bg-accent hover:text-accent-foreground rounded-md"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Button variant="ghost" className="ml-auto md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1">
        {navigationItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "w-full h-9 p-2 justify-start font-normal hover:bg-accent hover:text-accent-foreground rounded-md",
              isActive(item.href) ? "bg-accent text-accent-foreground" : ""
            )}
            onClick={() => navigate(item.href)}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.name}
          </Button>
        ))}
        <Button
          variant="ghost"
          className="w-full h-9 p-2 justify-start font-normal hover:bg-accent hover:text-accent-foreground rounded-md"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default AdminNavigation;
