
-- Create table for site branding information
CREATE TABLE public.site_branding (
    id INT PRIMARY KEY CHECK (id = 1),
    company_name TEXT NOT NULL DEFAULT 'RouteAura',
    logo_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for navigation links (header and footer)
CREATE TABLE public.navigation_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    href TEXT NOT NULL,
    link_type TEXT NOT NULL CHECK (link_type IN ('header', 'footer_quick', 'footer_legal')),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for footer specific settings
CREATE TABLE public.footer_settings (
    id INT PRIMARY KEY CHECK (id = 1),
    about_us_text TEXT,
    contact_address TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    social_facebook_url TEXT,
    social_twitter_url TEXT,
    social_instagram_url TEXT,
    social_youtube_url TEXT,
    newsletter_enabled BOOLEAN NOT NULL DEFAULT true,
    copyright_text TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default single row for site_branding
INSERT INTO public.site_branding (id, company_name) VALUES (1, 'Route Aura');

-- Insert default single row for footer_settings
INSERT INTO public.footer_settings (id, about_us_text, contact_address, contact_phone, contact_email, copyright_text, social_facebook_url, social_twitter_url, social_instagram_url, social_youtube_url)
VALUES (
    1,
    'Premium bus transportation services across the country. Reliable, comfortable, and safe journeys for all travelers.',
    '123 Bus Terminal, Highway Road, Transport City, TC 54321',
    '+1 (555) 123-4567',
    'info@travelbus.com',
    '© ' || EXTRACT(YEAR FROM now()) || ' RouteAura. All rights reserved.',
    '#', '#', '#', '#'
);

-- Insert default header navigation links from Navbar.tsx
INSERT INTO public.navigation_links (text, href, link_type, display_order) VALUES
('Home', '/', 'header', 0),
('About', '/about', 'header', 1),
('Routes', '/routes', 'header', 2),
('Fleet', '/fleet', 'header', 3),
('Contact', '/contact', 'header', 4),
('FAQ', '/faq', 'header', 5);

-- Insert default footer quick links from Footer.tsx
INSERT INTO public.navigation_links (text, href, link_type, display_order) VALUES
('Bus Routes', '/routes', 'footer_quick', 0),
('Our Fleet', '/fleet', 'footer_quick', 1),
('About Us', '/about', 'footer_quick', 2),
('Contact', '/contact', 'footer_quick', 3),
('FAQs', '/faq', 'footer_quick', 4),
('Blog', '/blog', 'footer_quick', 5);

-- Insert default footer legal links from Footer.tsx
INSERT INTO public.navigation_links (text, href, link_type, display_order) VALUES
('Terms of Service', '/terms', 'footer_legal', 0),
('Privacy Policy', '/privacy', 'footer_legal', 1),
('Cookie Policy', '/cookies', 'footer_legal', 2);

-- Enable RLS for all tables
ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_branding
CREATE POLICY "Allow public read access on site_branding" ON public.site_branding FOR SELECT USING (true);
CREATE POLICY "Allow superadmins to manage site_branding" ON public.site_branding FOR ALL USING (is_current_user_superadmin()) WITH CHECK (is_current_user_superadmin());

-- RLS Policies for navigation_links
CREATE POLICY "Allow public read access on navigation_links" ON public.navigation_links FOR SELECT USING (true);
CREATE POLICY "Allow superadmins to manage navigation_links" ON public.navigation_links FOR ALL USING (is_current_user_superadmin()) WITH CHECK (is_current_user_superadmin());

-- RLS Policies for footer_settings
CREATE POLICY "Allow public read access on footer_settings" ON public.footer_settings FOR SELECT USING (true);
CREATE POLICY "Allow superadmins to manage footer_settings" ON public.footer_settings FOR ALL USING (is_current_user_superadmin()) WITH CHECK (is_current_user_superadmin());

-- Apply existing trigger to update 'updated_at' timestamp
CREATE TRIGGER set_site_branding_updated_at
BEFORE UPDATE ON public.site_branding
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_navigation_links_updated_at
BEFORE UPDATE ON public.navigation_links
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_footer_settings_updated_at
BEFORE UPDATE ON public.footer_settings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();
