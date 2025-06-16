
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SuperAdminSetup from '@/components/admin/SuperAdminSetup';

const adminLoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  passKey: z.string().min(6, { message: 'Pass key must be at least 6 characters' }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { loginAdmin, adminUser, isLoading: authLoading } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: 'admin@travelbus.com',
      passKey: 'Admin@123',
    },
  });

  // If already logged in, redirect to admin dashboard
  React.useEffect(() => {
    if (adminUser) {
      navigate('/route-aura-booking-admin-page/dashboard');
    }
  }, [adminUser, navigate]);

  const onSubmit = async (values: AdminLoginFormValues) => {
    setIsLoading(true);
    
    try {
      console.log('Submitting admin login with:', values.email);
      toast.info('Attempting to login...');
      
      const success = await loginAdmin(values.email, values.passKey);
      
      if (success) {
        toast.success('Login successful, redirecting...');
        navigate('/route-aura-booking-admin-page/dashboard');
      } else {
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Login submission error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Display loading state while checking for existing session
  if (authLoading) {
    return (
      <div className="container max-w-md mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card className="border border-gray-200 shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center font-bold">Admin Login</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@example.com"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="passKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pass Key</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="text-sm text-center text-muted-foreground">
                This area is restricted to authorized personnel only
              </p>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Default credentials: admin@travelbus.com / Admin@123
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="setup">
          <SuperAdminSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLoginPage;
