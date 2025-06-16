
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDriverAuth } from '@/contexts/DriverAuthContext';

interface DriverProtectedRouteProps {
  children: React.ReactNode;
}

const DriverProtectedRoute: React.FC<DriverProtectedRouteProps> = ({ children }) => {
  const { driver, isLoading } = useDriverAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!driver) {
    return <Navigate to="/driver-login-page" replace />;
  }

  return <>{children}</>;
};

export default DriverProtectedRoute;
