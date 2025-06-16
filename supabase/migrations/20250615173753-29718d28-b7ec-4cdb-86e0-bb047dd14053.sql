
-- Create a dedicated storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery_images', 'gallery_images', true)
ON CONFLICT (id) DO NOTHING;

-- Add policies to the new storage bucket
-- Allow public read access to images
CREATE POLICY "Public can view gallery images" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'gallery_images');

-- Allow authenticated admins to upload, update, and delete images
CREATE POLICY "Admins can manage gallery images" ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'gallery_images' AND
  (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL)
)
WITH CHECK (
  bucket_id = 'gallery_images' AND
  (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL)
);

-- Create a table to organize images into categories
CREATE TABLE public.gallery_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create a table to store individual gallery images
CREATE TABLE public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.gallery_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    alt_text TEXT,
    image_url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    uploaded_by UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL
);

-- Add indexes for better query performance
CREATE INDEX idx_gallery_images_category_id ON public.gallery_images(category_id);
CREATE INDEX idx_gallery_categories_display_order ON public.gallery_categories(display_order);
CREATE INDEX idx_gallery_images_display_order ON public.gallery_images(display_order);

-- Enable Row Level Security on the new tables
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Define RLS policies for gallery_categories
CREATE POLICY "Public can view active gallery categories" ON public.gallery_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage gallery categories" ON public.gallery_categories
FOR ALL USING (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL);

-- Define RLS policies for gallery_images
CREATE POLICY "Public can view active gallery images" ON public.gallery_images
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage gallery images" ON public.gallery_images
FOR ALL USING (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL);

-- Insert initial sample data for categories
INSERT INTO public.gallery_categories (name, slug, description, display_order) VALUES
('Our Fleet', 'our-fleet', 'A look at our modern and comfortable buses.', 0),
('Our Facilities', 'our-facilities', 'Photos of our stations, waiting areas, and offices.', 1),
('Company Events', 'company-events', 'Moments from our company gatherings and milestones.', 2);

-- Insert placeholder data for images. These URLs will be replaced when admins upload real images.
WITH fleet_cat AS (SELECT id FROM public.gallery_categories WHERE slug = 'our-fleet'),
     facilities_cat AS (SELECT id FROM public.gallery_categories WHERE slug = 'our-facilities'),
     events_cat AS (SELECT id FROM public.gallery_categories WHERE slug = 'company-events')
INSERT INTO public.gallery_images (category_id, title, description, alt_text, image_url, is_featured)
VALUES
((SELECT id FROM fleet_cat), 'Luxury Coach', 'Our top-of-the-line coach for long-distance travel.', 'A large white luxury coach bus.', 'public/placeholder.svg', true),
((SELECT id FROM fleet_cat), 'City Sprinter', 'Perfect for shorter routes and city transits.', 'A smaller city sprinter bus.', 'public/placeholder.svg', false),
((SELECT id FROM facilities_cat), 'Main Terminal', 'Our clean and spacious main terminal.', 'Interior of a bus terminal with seating.', 'public/placeholder.svg', true),
((SELECT id FROM events_cat), '10th Anniversary Celebration', 'The team celebrating 10 years of service.', 'A group of people at a corporate event.', 'public/placeholder.svg', false);

-- Add a "Gallery" link to the main website navigation
INSERT INTO public.navigation_links (text, href, link_type, display_order)
VALUES ('Gallery', '/gallery', 'header', 4)
ON CONFLICT DO NOTHING;

