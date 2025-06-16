
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Send } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Error sending reset email');
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
              <Mail className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {emailSent ? 'Check Your Email' : 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {emailSent 
                ? 'We\'ve sent a password reset link to your email address.'
                : 'Enter your email address and we\'ll send you a link to reset your password.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    If an account with that email exists, you'll receive a password reset link shortly.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Another Email
                  </Button>
                  <Link to="/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
