
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchSiteSettings = async () => {
    const { data: branding, error: brandingError } = await supabase
        .from('site_branding')
        .select('*')
        .eq('id', 1)
        .single();

    if (brandingError) console.error('Failed to fetch site branding', brandingError);

    const { data: footer, error: footerError } = await supabase
        .from('footer_settings')
        .select('*')
        .eq('id', 1)
        .single();
    
    if (footerError) console.error('Failed to fetch footer settings', footerError);

    const { data: links, error: linksError } = await supabase
        .from('navigation_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
    
    if (linksError) console.error('Failed to fetch navigation links', linksError);

    const headerLinks = links?.filter(link => link.link_type === 'header') || [];
    const footerQuickLinks = links?.filter(link => link.link_type === 'footer_quick') || [];
    const footerLegalLinks = links?.filter(link => link.link_type === 'footer_legal') || [];

    return { branding, footer, headerLinks, footerQuickLinks, footerLegalLinks };
}

export const useSiteSettings = () => {
    return useQuery({
        queryKey: ['site-settings'],
        queryFn: fetchSiteSettings,
    });
};
