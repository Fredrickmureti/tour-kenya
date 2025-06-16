
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, MessageSquare, Calendar, User } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';

interface NavItem {
  name: string;
  path: string;
  icon: React.FC<any>;
}

interface MobileNavPanelProps {
  isOpen: boolean;
  navItems: NavItem[];
  user: AuthUser | null;
  handleLogout: () => void;
  closeMenu: () => void;
}

const MobileNavPanel: React.FC<MobileNavPanelProps> = ({ isOpen, navItems, user, handleLogout, closeMenu }) => (
  <div className={`md:hidden transition-all duration-300 ease-in-out ${
    isOpen ? 'max-h-screen opacity-100 p-4 border-t border-gray-200 dark:border-gray-700' : 'max-h-0 opacity-0 overflow-hidden'
  }`}>
    <div className="flex flex-col space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          onClick={closeMenu}
          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.name}
        </Link>
      ))}
      
      <hr className="border-gray-200 dark:border-gray-700 my-2" />
      
      {user ? (
        <div className="space-y-2">
          <div className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300">
            <User className="mr-3 h-5 w-5" />
            <span>Welcome, {user.email?.split('@')[0]}</span>
          </div>
          <Link to="/messages" onClick={closeMenu} className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            <MessageSquare className="mr-3 h-5 w-5" />
            Messages
          </Link>
          <Link to="/bookings" onClick={closeMenu} className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            <Calendar className="mr-3 h-5 w-5" />
            My Bookings
          </Link>
          <Button onClick={() => { handleLogout(); closeMenu(); }} variant="ghost" className="w-full justify-start px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Link to="/login" onClick={closeMenu}>
            <Button variant="outline" className="w-full">Sign In</Button>
          </Link>
          <Link to="/signup" onClick={closeMenu}>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">Sign Up</Button>
          </Link>
        </div>
      )}
    </div>
  </div>
);

export default MobileNavPanel;
