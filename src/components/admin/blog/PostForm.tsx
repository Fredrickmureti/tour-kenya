
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featured_image_url: z.string().url().optional().or(z.literal('')),
  is_published: z.boolean(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: any;
  onSubmit: (data: PostFormValues) => void;
  isLoading: boolean;
  isEdit?: boolean;
}

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export const PostForm: React.FC<PostFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  isEdit = false
}) => {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { is_published: false, title: '', slug: '' }
  });

  const titleValue = watch('title');
  const featuredImageUrl = watch('featured_image_url');

  useEffect(() => {
    if (titleValue) {
      setValue('slug', slugify(titleValue));
    }
  }, [titleValue, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        slug: initialData.slug,
        content: initialData.content || '',
        excerpt: initialData.excerpt || '',
        featured_image_url: initialData.featured_image_url || '',
        is_published: initialData.is_published,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>
      
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...register('slug')} />
        {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
      </div>
      
      <div>
        <Label htmlFor="featured_image_url">Featured Image URL</Label>
        <Input id="featured_image_url" {...register('featured_image_url')} placeholder="https://example.com/image.jpg" />
        {errors.featured_image_url && <p className="text-red-500 text-sm mt-1">{errors.featured_image_url.message}</p>}
        {featuredImageUrl && (
          <div className="mt-4">
            <Label>Image Preview</Label>
            <img 
              src={featuredImageUrl} 
              alt="Featured image preview" 
              className="mt-2 rounded-lg max-h-64 w-auto object-cover" 
              onError={(e) => (e.currentTarget.style.display = 'none')} 
              onLoad={(e) => (e.currentTarget.style.display = 'block')}
            />
          </div>
        )}
      </div>
      
      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" {...register('excerpt')} placeholder="A short summary of the post..." />
      </div>
      
      <div>
        <Label htmlFor="content">Content (HTML supported)</Label>
        <Textarea 
          id="content" 
          {...register('content')} 
          rows={15} 
          placeholder="Write your post content here. You can use HTML tags like <p>, <ul>, <li>, etc." 
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="is_published" 
          checked={watch('is_published')} 
          onCheckedChange={(checked) => setValue('is_published', checked)} 
        />
        <Label htmlFor="is_published">Publish Post</Label>
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : (isEdit ? 'Update Post' : 'Create Post')}
      </Button>
    </form>
  );
};
