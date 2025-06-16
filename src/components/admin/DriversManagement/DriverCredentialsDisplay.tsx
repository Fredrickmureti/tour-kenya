
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DriverCredentialsDisplayProps {
  email: string;
  password: string;
  driverName: string;
  fleetAssignment?: string;
  onClose: () => void;
}

export const DriverCredentialsDisplay: React.FC<DriverCredentialsDisplayProps> = ({
  email,
  password,
  driverName,
  fleetAssignment,
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
    const credentials = `Driver Login Credentials
Name: ${driverName}
Email: ${email}
Password: ${password}
${fleetAssignment ? `Fleet Assignment: ${fleetAssignment}` : ''}
Login URL: ${window.location.origin}/driver-login-page`;

    try {
      await navigator.clipboard.writeText(credentials);
      toast.success('All credentials copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy credentials');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          Driver Created Successfully
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Driver: <strong>{driverName}</strong></p>
          {fleetAssignment && (
            <Badge variant="secondary" className="mb-3">
              Assigned to: {fleetAssignment}
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Email</label>
              <p className="font-mono text-sm">{email}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(email, 'Email')}
              className="ml-2"
            >
              {copiedField === 'Email' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Password</label>
              <p className="font-mono text-sm">
                {showPassword ? password : '•'.repeat(password.length)}
              </p>
            </div>
            <div className="flex gap-1 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(password, 'Password')}
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

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={copyAllCredentials} variant="outline" className="w-full">
            <Copy className="h-4 w-4 mr-2" />
            Copy All Credentials
          </Button>
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center pt-2">
          Driver can login at: <span className="font-mono">{window.location.origin}/driver-login-page</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverCredentialsDisplay;
