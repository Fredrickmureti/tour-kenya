
export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  alt_text: string | null;
  image_url: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  uploaded_at: string;
  uploaded_by: string | null;
  gallery_categories?: { name: string } | null;
}
