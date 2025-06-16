
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Calendar, LogOut, MessageSquare } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface DesktopActionButtonsProps {
  user: User | null;
  handleLogout: () => void;
}

const DesktopActionButtons: React.FC<DesktopActionButtonsProps> = ({ user, handleLogout }) => (
  <div className="hidden md:flex items-center space-x-4">
    <ThemeToggle />
    
    {user ? (
      <div className="flex items-center space-x-2">
        <Link to="/messages">
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
          </Button>
        </Link>
        <Link to="/bookings">
          <Button variant="ghost" size="icon">
            <Calendar className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center space-x-2 pl-2 border-l border-gray-300 dark:border-gray-600">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Welcome, {user.email?.split('@')[0]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ) : (
      <div className="flex items-center space-x-2">
        <Link to="/login">
          <Button variant="ghost" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
            Sign In
          </Button>
        </Link>
        <Link to="/signup">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">
            Sign Up
          </Button>
        </Link>
      </div>
    )}
  </div>
);

export default DesktopActionButtons;
