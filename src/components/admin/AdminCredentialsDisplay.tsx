
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AdminCredentialsDisplayProps {
  email: string;
  password: string;
  role: string;
  branchName?: string;
  onClose: () => void;
}

const AdminCredentialsDisplay: React.FC<AdminCredentialsDisplayProps> = ({
  email,
  password,
  role,
  branchName,
  onClose
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyAllCredentials = async () => {
    const credentials = `Admin Credentials:
Email: ${email}
Password: ${password}
Role: ${role}${branchName ? `\nBranch: ${branchName}` : ''}
Login URL: ${window.location.origin}/route-aura-booking-admin-page

Please store these credentials securely and change the password after first login.`;

    try {
      await navigator.clipboard.writeText(credentials);
      toast.success('All credentials copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy credentials');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-green-200 bg-green-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle className="text-green-800">Admin Created Successfully!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-4">
          <Badge variant="outline" className="text-green-700 border-green-300">
            {role === 'superadmin' ? 'Super Admin' : 'Branch Admin'}
          </Badge>
          {branchName && (
            <div className="text-sm text-gray-600 mt-1">Branch: {branchName}</div>
          )}
        </div>

        <div className="space-y-3">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                {email}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(email, 'Email')}
                className="px-2"
              >
                {copiedField === 'Email' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                {showPassword ? password : '••••••••••••'}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPassword(!showPassword)}
                className="px-2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(password, 'Password')}
                className="px-2"
              >
                {copiedField === 'Password' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <Button
            onClick={copyAllCredentials}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy All Credentials
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center p-3 bg-yellow-50 rounded border border-yellow-200">
          <strong>Important:</strong> Store these credentials securely. The admin should change their password after first login.
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCredentialsDisplay;
