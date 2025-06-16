
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AuthCallbackHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle hash-based auth tokens from email confirmation
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Auth callback error:', error);
            toast.error('Authentication failed. Please try again.');
            navigate('/login');
            return;
          }

          if (data.user) {
            toast.success('Email confirmed successfully! Welcome!');
            
            // Check for pending booking state
            const pendingBooking = localStorage.getItem('pendingBooking');
            if (pendingBooking) {
              try {
                const bookingState = JSON.parse(pendingBooking);
                console.log('Restoring booking state after email confirmation:', bookingState);
                
                // Navigate back to the booking with the stored state
                if (bookingState.returnUrl) {
                  navigate(bookingState.returnUrl);
                } else if (bookingState.routeId) {
                  const params = new URLSearchParams();
                  if (bookingState.date) params.set('date', bookingState.date);
                  if (bookingState.branchId) params.set('branchId', bookingState.branchId);
                  navigate(`/booking/${bookingState.routeId}?${params.toString()}`);
                } else {
                  navigate('/');
                }
                
                toast.success('Your booking has been restored!');
              } catch (error) {
                console.error('Error restoring booking state:', error);
                localStorage.removeItem('pendingBooking');
                navigate('/');
              }
            } else {
              navigate('/');
            }
          }
        } else {
          // No auth tokens in URL, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback handler error:', error);
        toast.error('An error occurred during authentication.');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirming your email...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallbackHandler;
