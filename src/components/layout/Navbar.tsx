
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { 
  Home, 
  Info, 
  Mail, 
  Route, 
  Car, 
  HelpCircle, 
  Link as LinkIcon 
} from 'lucide-react';
import NavLogo from './nav/NavLogo';
import DesktopNavLinks from './nav/DesktopNavLinks';
import DesktopActionButtons from './nav/DesktopActionButtons';
import MobileMenuButton from './nav/MobileMenuButton';
import MobileNavPanel from './nav/MobileNavPanel';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { data: settings, isLoading } = useSiteSettings();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  }

  const navItems = settings?.headerLinks.map(item => {
    const iconMap: { [key: string]: React.FC<any> } = { Home, Info, Route, Car, Mail, HelpCircle };
    const Icon = iconMap[item.text] || LinkIcon;
    return { name: item.text, path: item.href, icon: Icon };
  }) || [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLogo 
            logoUrl={settings?.branding?.logo_url}
            companyName={settings?.branding?.company_name}
            isLoading={isLoading}
          />

          <DesktopNavLinks navItems={navItems.map(i => ({name: i.name, path: i.path}))} isLoading={isLoading} />
          
          <DesktopActionButtons user={user} handleLogout={handleLogout} />
          
          <MobileMenuButton isOpen={isMobileMenuOpen} toggle={toggleMobileMenu} />
        </div>

        <MobileNavPanel 
          isOpen={isMobileMenuOpen}
          navItems={navItems}
          user={user}
          handleLogout={handleLogout}
          closeMenu={closeMobileMenu}
        />
      </div>
    </nav>
  );
};

export default Navbar;
