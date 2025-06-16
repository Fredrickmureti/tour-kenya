
import React from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface NavItem {
  name: string;
  path: string;
}

interface DesktopNavLinksProps {
  navItems: NavItem[];
  isLoading: boolean;
}

const DesktopNavLinks: React.FC<DesktopNavLinksProps> = ({ navItems, isLoading }) => (
  <div className="hidden md:flex items-center space-x-1">
    {isLoading ? (
      <>
        <Skeleton className="w-20 h-8" />
        <Skeleton className="w-20 h-8" />
        <Skeleton className="w-20 h-8" />
      </>
    ) : (
      navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
        >
          {item.name}
        </Link>
      ))
    )}
  </div>
);

export default DesktopNavLinks;
