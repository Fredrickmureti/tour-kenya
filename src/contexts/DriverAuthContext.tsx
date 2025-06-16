
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface Driver {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  license_number: string;
  status: string;
  experience_years: number | null;
  total_trips: number | null;
  rating: number | null;
}

interface DriverAuthContextType {
  driver: Driver | null;
  isLoading: boolean;
  loginDriver: (email: string, password: string) => Promise<boolean>;
  logoutDriver: () => void;
}

const DriverAuthContext = createContext<DriverAuthContextType | undefined>(undefined);

export const useDriverAuth = () => {
  const context = useContext(DriverAuthContext);
  if (context === undefined) {
    throw new Error('useDriverAuth must be used within a DriverAuthProvider');
  }
  return context;
};

export const DriverAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if driver is already logged in
    const storedDriverData = localStorage.getItem('driver_session');
    if (storedDriverData) {
      try {
        const driverData = JSON.parse(storedDriverData);
        setDriver(driverData);
      } catch (error) {
        console.error('Error parsing stored driver data:', error);
        localStorage.removeItem('driver_session');
      }
    }
    setIsLoading(false);
  }, []);

  const loginDriver = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting driver login for:', email);
      
      // Get driver auth record with driver details
      const { data: authData, error: authError } = await supabase
        .from('driver_auth')
        .select(`
          *,
          drivers(*)
        `)
        .eq('email', email.toLowerCase())
        .single();

      if (authError || !authData) {
        console.error('Driver authentication failed:', authError);
        return false;
      }

      console.log('Found driver auth data:', authData);

      // Verify password using bcrypt
      let passwordMatch = false;
      try {
        passwordMatch = await bcrypt.compare(password, authData.pass_key);
      } catch (bcryptError) {
        console.log('Password verification failed:', bcryptError);
        return false;
      }

      if (!passwordMatch) {
        console.error('Password verification failed');
        return false;
      }

      // Check if driver is active
      if (authData.drivers.status !== 'active') {
        console.error('Driver account is not active');
        return false;
      }

      // Update last login
      await supabase
        .from('driver_auth')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.id);

      // Set driver state
      const driverData = authData.drivers;
      setDriver(driverData);
      
      // Store in localStorage
      localStorage.setItem('driver_session', JSON.stringify(driverData));

      console.log('Driver login successful');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logoutDriver = () => {
    setDriver(null);
    localStorage.removeItem('driver_session');
  };

  const value = {
    driver,
    isLoading,
    loginDriver,
    logoutDriver,
  };

  return (
    <DriverAuthContext.Provider value={value}>
      {children}
    </DriverAuthContext.Provider>
  );
};
