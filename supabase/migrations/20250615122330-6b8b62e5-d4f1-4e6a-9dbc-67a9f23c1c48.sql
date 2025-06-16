
-- Create blog_categories table to organize posts
CREATE TABLE public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create blog_posts table to store blog articles
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    featured_image_url TEXT,
    author_id UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create a trigger to automatically update the 'updated_at' timestamp on post updates
CREATE OR REPLACE FUNCTION public.update_blog_post_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_blog_post_timestamp
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_post_timestamp();

-- Create a junction table to link posts and categories (many-to-many)
CREATE TABLE public.blog_post_categories (
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- Enable Row Level Security for all new tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- Public users can read published posts and all categories
CREATE POLICY "Public can view blog categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Public can view published blog posts" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view blog post category links" ON public.blog_post_categories FOR SELECT USING (true);

-- Admins can manage all blog-related data
CREATE POLICY "Admins can manage blog categories" ON public.blog_categories FOR ALL USING (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL);
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts FOR ALL USING (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL);
CREATE POLICY "Admins can manage blog post categories" ON public.blog_post_categories FOR ALL USING (is_current_user_superadmin() OR get_current_branch_admin_branch_id() IS NOT NULL);

-- Insert initial data to populate the blog
INSERT INTO public.blog_categories (name, slug, description) VALUES
('Company News', 'company-news', 'Updates and announcements from RouteAura.'),
('Travel Tips', 'travel-tips', 'Helpful tips for your next journey.'),
('Destinations', 'destinations', 'Information about our amazing destinations.');

INSERT INTO public.blog_posts (title, slug, content, excerpt, is_published, published_at)
VALUES
(
  'Welcome to the New RouteAura Blog!',
  'welcome-to-routeaura-blog',
  '<p>We are thrilled to launch our new blog! Here you will find company news, travel tips, and much more. Stay tuned for exciting content that will make your travels with us even better.</p><p>Our mission is to provide safe, reliable, and comfortable bus transportation. Through this blog, we hope to connect with you, our valued customers, on a deeper level.</p>',
  'We are thrilled to launch our new blog! Here you will find company news, travel tips, and much more.',
  true,
  now()
),
(
  'Top 5 Essential Items for Bus Travel',
  'top-5-essential-items-for-bus-travel',
  '<p>Are you ready for your next bus trip? Make sure you pack these 5 essential items to ensure a comfortable journey:</p><ul><li>A travel pillow for napping on the go.</li><li>Noise-cancelling headphones to enjoy your music or podcasts.</li><li>A portable charger to keep your devices powered up.</li><li>Snacks and a water bottle to stay refreshed.</li><li>A good book or downloaded movies for entertainment.</li></ul>',
  'Packing for a bus trip? Here are the top 5 essential items you should not forget to make your journey more comfortable.',
  true,
  now()
);

-- Associate the new posts with categories
INSERT INTO public.blog_post_categories (post_id, category_id)
SELECT
    (SELECT id FROM public.blog_posts WHERE slug = 'welcome-to-routeaura-blog'),
    (SELECT id FROM public.blog_categories WHERE slug = 'company-news');

INSERT INTO public.blog_post_categories (post_id, category_id)
SELECT
    (SELECT id FROM public.blog_posts WHERE slug = 'top-5-essential-items-for-bus-travel'),
    (SELECT id FROM public.blog_categories WHERE slug = 'travel-tips');

