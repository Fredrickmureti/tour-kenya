
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube 
} from 'lucide-react';

const Footer: React.FC = () => {
  const { data: settings, isLoading } = useSiteSettings();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            {isLoading ? <Skeleton className="w-32 h-8 mb-4" /> : <h3 className="text-2xl font-bold text-white font-display mb-4">{settings?.branding?.company_name || 'TravelBus'}</h3>}
            {isLoading ? <Skeleton className="w-full h-16" /> : <p className="mb-4">{settings?.footer?.about_us_text}</p>}
            <div className="flex space-x-4 mt-6">
              {isLoading ? <>
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="w-5 h-5 rounded-full" />
              </> : <>
                {settings?.footer?.social_facebook_url && <a href={settings.footer.social_facebook_url} className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>}
                {settings?.footer?.social_twitter_url && <a href={settings.footer.social_twitter_url} className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>}
                {settings?.footer?.social_instagram_url && <a href={settings.footer.social_instagram_url} className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>}
                {settings?.footer?.social_youtube_url && <a href={settings.footer.social_youtube_url} className="text-gray-400 hover:text-white transition-colors"><Youtube size={20} /></a>}
              </>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            {isLoading ? <div className="space-y-2">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-28 h-4" />
            </div> : <ul className="space-y-2">
              {settings?.footerQuickLinks.map(link => (
                <li key={link.id}><Link to={link.href} className="hover:text-brand-300 transition-colors">{link.text}</Link></li>
              ))}
            </ul>}
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            {isLoading ? <div className="space-y-3">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-3/4 h-6" />
              <Skeleton className="w-3/4 h-6" />
            </div> : <div className="space-y-3">
              {settings?.footer?.contact_address && <div className="flex items-start"><MapPin size={18} className="mr-3 mt-1 text-brand-400" /><span>{settings.footer.contact_address}</span></div>}
              {settings?.footer?.contact_phone && <div className="flex items-center"><Phone size={18} className="mr-3 text-brand-400" /><span>{settings.footer.contact_phone}</span></div>}
              {settings?.footer?.contact_email && <div className="flex items-center"><Mail size={18} className="mr-3 text-brand-400" /><span>{settings.footer.contact_email}</span></div>}
            </div>}
          </div>

          {/* Newsletter */}
          {settings?.footer?.newsletter_enabled && <div>
            <h4 className="text-lg font-semibold text-white mb-4">Newsletter</h4>
            <p className="mb-4">Subscribe to our newsletter for promotions and travel updates.</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:border-brand-500"
              />
              <button 
                type="submit" 
                className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          {isLoading ? <Skeleton className="w-48 h-5" /> : <p>{settings?.footer?.copyright_text || `© ${new Date().getFullYear()} TravelBus. All rights reserved.`}</p>}
          <div className="mt-4 md:mt-0 flex space-x-6">
            {isLoading ? <>
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-24 h-4" />
            </> : <>
              {settings?.footerLegalLinks.map(link => (
                <Link key={link.id} to={link.href} className="hover:text-white transition-colors">{link.text}</Link>
              ))}
            </>}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
