
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Branch {
  id: string;
  name: string;
}

interface CreateAdminResponse {
  success: boolean;
  message?: string;
  error?: string;
  user_id?: string;
  email?: string;
  is_update?: boolean;
}

interface CreateAdminFormProps {
  onSuccess: () => void;
  isSuperAdminCreator: boolean;
}

export const CreateAdminForm: React.FC<CreateAdminFormProps> = ({ onSuccess, isSuperAdminCreator }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState<string | undefined>(undefined);
  const [isNewAdminSuper, setIsNewAdminSuper] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: branches, isLoading: isLoadingBranches } = useQuery<Branch[]>({
    queryKey: ['all-branches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('id, name').eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (params: { email: string; password: string; branchId: string | null; isSuperAdmin: boolean; }) => {
      console.log('Calling create_admin_user_v2 database function with:', params);
      
      const { data, error } = await supabase.rpc('create_admin_user_v2', {
        p_email: params.email,
        p_password: params.password,
        p_branch_id: params.branchId,
        p_is_superadmin: params.isSuperAdmin,
      });

      if (error) {
        console.error('Database function error:', error);
        throw error;
      }

      const response = (data as unknown) as CreateAdminResponse;

      if (!response || typeof response !== 'object' || typeof response.success !== 'boolean') {
        throw new Error('Invalid response format from database function');
      }

      if (!response.success) {
        throw new Error(response.error || 'Unknown error occurred');
      }

      return response;
    },
    onSuccess: (data: CreateAdminResponse) => {
      console.log('Admin user created successfully:', data);
      toast.success(data?.message || 'Admin user created successfully! Login credentials are ready.');
      setEmail('');
      setPassword('');
      setBranchId(undefined);
      setIsNewAdminSuper(false);
      onSuccess();
      setIsLoading(false);
    },
    onError: (error: any) => {
      console.error('Error creating admin user:', error);
      toast.error(`Failed to create admin user: ${error.message}`);
      setIsLoading(false);
    },
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required.');
      return;
    }
    if (!password) {
      toast.error('Password is required.');
      return;
    }
    if (!isNewAdminSuper && !branchId) {
      toast.error('Branch assignment is required for a branch admin.');
      return;
    }
    
    setIsLoading(true);
    createAdminMutation.mutate({
      email: email,
      password: password,
      branchId: isNewAdminSuper ? null : branchId!,
      isSuperAdmin: isNewAdminSuper,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Admin Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          This admin will be created with secure authentication.
        </p>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="flex gap-2">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a secure password"
            required
          />
          <Button type="button" variant="outline" onClick={generatePassword}>
            Generate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          The admin will use this password to log in. You can generate a secure password.
        </p>
      </div>

      {isSuperAdminCreator && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_superadmin"
            checked={isNewAdminSuper}
            onCheckedChange={(checked) => setIsNewAdminSuper(Boolean(checked))}
          />
          <Label htmlFor="is_superadmin">Make Superadmin</Label>
        </div>
      )}

      {!isNewAdminSuper && (
        <div>
          <Label htmlFor="branch">Assign Branch</Label>
          <Select value={branchId} onValueChange={setBranchId} required={!isNewAdminSuper}>
            <SelectTrigger id="branch" disabled={isLoadingBranches}>
              <SelectValue placeholder={isLoadingBranches ? "Loading branches..." : "Select branch"} />
            </SelectTrigger>
            <SelectContent>
              {branches?.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <Button type="submit" disabled={isLoading || isLoadingBranches} className="w-full">
        {isLoading ? 'Creating Admin User...' : 'Create Admin User'}
      </Button>
    </form>
  );
};
