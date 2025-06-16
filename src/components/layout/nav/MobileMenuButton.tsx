
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface MobileMenuButtonProps {
  isOpen: boolean;
  toggle: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, toggle }) => (
  <div className="md:hidden flex items-center space-x-2">
    <ThemeToggle />
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="text-gray-700 dark:text-gray-300"
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  </div>
);

export default MobileMenuButton;
