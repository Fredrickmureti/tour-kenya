
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, User } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || 'Failed to login');
      } else {
        // Check for pending booking state
        const pendingBooking = localStorage.getItem('pendingBooking');
        
        if (pendingBooking) {
          try {
            const bookingState = JSON.parse(pendingBooking);
            console.log('Restoring booking state:', bookingState);
            
            // Navigate back to the booking page with the stored state
            if (bookingState.returnUrl) {
              navigate(bookingState.returnUrl);
            } else if (bookingState.routeId) {
              const params = new URLSearchParams();
              if (bookingState.date) params.set('date', bookingState.date);
              if (bookingState.branchId) params.set('branchId', bookingState.branchId);
              navigate(`/booking/${bookingState.routeId}?${params.toString()}`);
            } else {
              navigate(redirectUrl || '/');
            }
            
            toast.success('Welcome back! Your booking has been restored.');
          } catch (error) {
            console.error('Error restoring booking state:', error);
            localStorage.removeItem('pendingBooking');
            navigate(redirectUrl || '/');
            toast.success('Welcome back!');
          }
        } else {
          navigate(redirectUrl || '/');
          toast.success('Welcome back!');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <LogIn className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your Route Aura account
              {redirectUrl && (
                <div className="mt-2 text-sm text-blue-600">
                  Continue with your booking after login
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 transition-all focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                </span>
                <Link 
                  to="/signup" 
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
