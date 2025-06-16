
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff } from 'lucide-react';

const SuperAdminSetup = () => {
  const [email, setEmail] = useState('admin@travelbus.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setupSuperAdmin = async () => {
    setIsLoading(true);
    
    try {
      console.log('Setting up superadmin with email:', email);
      
      // First check if admin user already exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_users')
        .select('user_id, email')
        .eq('email', email)
        .single();

      let adminUuid = existingAdmin?.user_id;

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing admin:', checkError);
        toast.error('Error checking existing admin user');
        setIsLoading(false);
        return;
      }

      // Generate UUID if admin doesn't exist
      if (!adminUuid) {
        adminUuid = crypto.randomUUID();
        console.log('Creating new admin with UUID:', adminUuid);
      } else {
        console.log('Found existing admin with UUID:', adminUuid);
      }

      // Hash the password using the proper bcrypt function
      const { data: hashedPassword, error: hashError } = await supabase
        .rpc('hash_password', { password });
      
      if (hashError) {
        toast.error('Failed to hash password');
        console.error('Hash error:', hashError);
        setIsLoading(false);
        return;
      }

      console.log('Password hashed successfully');

      // Upsert admin user with proper role
      const { error: userError } = await supabase
        .from('admin_users')
        .upsert({
          user_id: adminUuid,
          email,
          role: 'superadmin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        });

      if (userError) {
        toast.error('Failed to create/update admin user');
        console.error('User error:', userError);
        setIsLoading(false);
        return;
      }

      console.log('Admin user record updated successfully');

      // Upsert admin auth with proper bcrypt hash
      const { error: authError } = await supabase
        .from('admin_auth')
        .upsert({
          user_id: adminUuid,
          pass_key_hash: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (authError) {
        toast.error('Failed to create/update admin auth');
        console.error('Auth error:', authError);
        setIsLoading(false);
        return;
      }

      console.log('Admin auth record updated successfully');

      // Upsert branch admin with proper superadmin flag
      const { error: branchError } = await supabase
        .from('branch_admins')
        .upsert({
          user_id: adminUuid,
          admin_email: email,
          is_superadmin: true,
          branch_id: null, // Superadmin doesn't belong to a specific branch
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (branchError) {
        toast.error('Failed to create/update branch admin');
        console.error('Branch error:', branchError);
        setIsLoading(false);
        return;
      }

      console.log('Branch admin record updated successfully');

      if (existingAdmin) {
        toast.success('Superadmin credentials updated successfully! You can now login with the new password.');
      } else {
        toast.success('Superadmin created successfully! You can now login.');
      }
      
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(`Setup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Setup Superadmin
        </CardTitle>
        <CardDescription>
          Create or update the superadmin account for the system. This will ensure proper password hashing and role assignment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@travelbus.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin@123"
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
        
        <Button 
          onClick={setupSuperAdmin}
          disabled={isLoading || !email || !password}
          className="w-full"
        >
          {isLoading ? 'Setting up...' : 'Setup/Update Superadmin'}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          This will create or update a superadmin account with proper bcrypt password hashing and correct role assignment.
        </p>
      </CardContent>
    </Card>
  );
};

export default SuperAdminSetup;
