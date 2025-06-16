
-- Create table for main about content sections
CREATE TABLE public.about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES admin_users(user_id)
);

-- Create table for company values
CREATE TABLE public.company_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subtitle TEXT,
  icon_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES admin_users(user_id)
);

-- Create table for history milestones
CREATE TABLE public.history_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES admin_users(user_id)
);

-- Create table for team members
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES admin_users(user_id)
);

-- Create table for company statistics
CREATE TABLE public.company_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES admin_users(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (superadmin only for modifications, public read access)
CREATE POLICY "Public can view active about content" ON public.about_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Superadmins can manage about content" ON public.about_content
  FOR ALL USING (is_current_user_superadmin());

CREATE POLICY "Public can view active company values" ON public.company_values
  FOR SELECT USING (is_active = true);

CREATE POLICY "Superadmins can manage company values" ON public.company_values
  FOR ALL USING (is_current_user_superadmin());

CREATE POLICY "Public can view active history milestones" ON public.history_milestones
  FOR SELECT USING (is_active = true);

CREATE POLICY "Superadmins can manage history milestones" ON public.history_milestones
  FOR ALL USING (is_current_user_superadmin());

CREATE POLICY "Public can view active team members" ON public.team_members
  FOR SELECT USING (is_active = true);

CREATE POLICY "Superadmins can manage team members" ON public.team_members
  FOR ALL USING (is_current_user_superadmin());

CREATE POLICY "Public can view active company statistics" ON public.company_statistics
  FOR SELECT USING (is_active = true);

CREATE POLICY "Superadmins can manage company statistics" ON public.company_statistics
  FOR ALL USING (is_current_user_superadmin());

-- Create update triggers
CREATE OR REPLACE FUNCTION update_about_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_about_content_timestamp
  BEFORE UPDATE ON public.about_content
  FOR EACH ROW EXECUTE FUNCTION update_about_content_timestamp();

CREATE TRIGGER update_company_values_timestamp
  BEFORE UPDATE ON public.company_values
  FOR EACH ROW EXECUTE FUNCTION update_about_content_timestamp();

CREATE TRIGGER update_history_milestones_timestamp
  BEFORE UPDATE ON public.history_milestones
  FOR EACH ROW EXECUTE FUNCTION update_about_content_timestamp();

CREATE TRIGGER update_team_members_timestamp
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION update_about_content_timestamp();

CREATE TRIGGER update_company_statistics_timestamp
  BEFORE UPDATE ON public.company_statistics
  FOR EACH ROW EXECUTE FUNCTION update_about_content_timestamp();

-- Insert initial content from the existing About page
INSERT INTO public.about_content (section_key, title, content, subtitle) VALUES
('hero_title', 'About TravelBus', 'Connecting cities and people with comfortable, reliable bus transportation since 2005', NULL),
('story_title', 'Our Story', 'TravelBus began with a simple mission: to provide affordable, comfortable transportation that connects people and places. Founded in 2005, we started with just 5 buses serving the eastern corridor.', NULL),
('story_content_1', 'Growth Story', 'Today, we''ve grown to become one of the nation''s premier bus transportation companies, with a modern fleet of over 200 vehicles serving routes across the entire United States.', NULL),
('story_content_2', 'Our Values', 'Throughout our journey, we''ve remained committed to our core values of reliability, comfort, and customer satisfaction. We continue to innovate and improve our services to provide the best possible travel experience.', NULL),
('mission_title', 'Our Mission & Values', 'We''re driven by our commitment to providing exceptional bus travel experiences while maintaining high standards in every aspect of our business.', NULL),
('cta_title', 'Ready to Experience TravelBus?', 'Join the millions of satisfied travelers who choose TravelBus for reliable, comfortable journeys.', NULL);

INSERT INTO public.company_values (title, description, subtitle, display_order) VALUES
('Reliability', 'We understand that punctuality is crucial for travelers. Our commitment to schedule adherence and route reliability is unwavering, ensuring you reach your destination on time, every time.', 'The foundation of our service', 1),
('Comfort', 'Travel should be pleasant, not just a means to an end. Our buses are designed with your comfort in mind, featuring spacious seating, climate control, and modern amenities.', 'Enjoyable journey experience', 2),
('Sustainability', 'We''re committed to reducing our environmental impact. From implementing fuel-efficient driving practices to investing in electric buses, we''re working toward a greener future.', 'Responsible transportation', 3);

INSERT INTO public.history_milestones (year, title, description, display_order) VALUES
('2005', 'Company Founding', 'TravelBus was founded with just 5 buses, focusing on connecting major cities along the east coast.', 1),
('2010', 'Expansion Phase', 'Expanded our fleet to 50 buses and extended routes to include the midwest region.', 2),
('2015', 'Technology Integration', 'Launched our first mobile app and implemented digital ticketing systems for seamless booking.', 3),
('2018', 'Premium Fleet Introduction', 'Introduced our premium and luxury bus classes with enhanced amenities for superior comfort.', 4),
('2021', 'Nationwide Coverage', 'Achieved nationwide route coverage with over 200 buses connecting all major US cities.', 5),
('2023', 'Sustainability Initiative', 'Began transitioning to a greener fleet with the introduction of our first electric buses.', 6);

INSERT INTO public.team_members (name, role, bio, image_url, display_order) VALUES
('Michael Johnson', 'Chief Executive Officer', 'Michael has over 20 years of experience in the transportation industry and has led TravelBus to become a national leader in bus travel.', 'https://randomuser.me/api/portraits/men/32.jpg', 1),
('Sarah Williams', 'Chief Operations Officer', 'With a background in logistics and fleet management, Sarah ensures our nationwide operations run smoothly and efficiently.', 'https://randomuser.me/api/portraits/women/44.jpg', 2),
('David Chen', 'Chief Technology Officer', 'David leads our technical innovations, from our booking platform to route optimization systems.', 'https://randomuser.me/api/portraits/men/67.jpg', 3),
('Emily Rodriguez', 'Customer Experience Director', 'Emily is passionate about creating exceptional travel experiences and oversees all customer service initiatives.', 'https://randomuser.me/api/portraits/women/28.jpg', 4);

INSERT INTO public.company_statistics (stat_key, value, label, display_order) VALUES
('buses', '200+', 'Modern Buses', 1),
('routes', '500+', 'Daily Routes', 2),
('passengers', '2M+', 'Annual Passengers', 3),
('cities', '100+', 'Cities Served', 4);
