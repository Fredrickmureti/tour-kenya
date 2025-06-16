
import React from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface NavLogoProps {
  logoUrl: string | null | undefined;
  companyName: string | undefined;
  isLoading: boolean;
}

const NavLogo: React.FC<NavLogoProps> = ({ logoUrl, companyName, isLoading }) => (
  <Link to="/" className="flex items-center space-x-2 hover:scale-105 transition-transform">
    {isLoading ? (
      <Skeleton className="w-8 h-8 rounded-lg" />
    ) : logoUrl ? (
      <img src={logoUrl} alt={companyName || 'Company Logo'} className="h-8 w-auto object-contain" />
    ) : (
      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {companyName?.substring(0, 2).toUpperCase() || 'RA'}
        </span>
      </div>
    )}
    
    {isLoading ? <Skeleton className="w-24 h-6" /> :
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
        {companyName || 'Route Aura'}
      </span>
    }
  </Link>
);

export default NavLogo;
