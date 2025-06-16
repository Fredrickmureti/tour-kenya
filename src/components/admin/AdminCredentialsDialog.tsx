
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, Eye, EyeOff, Key } from 'lucide-react';

interface AdminCredentialsDialogProps {
  email: string;
  password?: string;
}

export const AdminCredentialsDialog: React.FC<AdminCredentialsDialogProps> = ({
  email,
  password = 'Generated password (contact admin)'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    });
  };

  const copyAllCredentials = () => {
    const credentials = `Email: ${email}\nPassword: ${password}`;
    copyToClipboard(credentials, 'Credentials');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="h-4 w-4 mr-2" />
          View Credentials
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Admin Login Credentials</DialogTitle>
          <DialogDescription>
            Use these credentials to log in to the admin panel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                value={email}
                readOnly
                className="bg-muted"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(email, 'Email')}
                className="px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  readOnly
                  className="bg-muted pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(password, 'Password')}
                className="px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={copyAllCredentials}
              className="flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copy All</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
