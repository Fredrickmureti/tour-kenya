
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Facebook } from 'lucide-react';

export const SocialAuthButtons: React.FC = () => {
  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full">
          <Mail className="mr-2 h-4 w-4" />
          Email
        </Button>
        <Button variant="outline" className="w-full">
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </Button>
      </div>
    </div>
  );
};
