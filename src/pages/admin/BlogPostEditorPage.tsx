import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featured_image_url: z.string().url().optional().or(z.literal('')),
  is_published: z.boolean(),
});

type PostFormValues = z.infer<typeof postSchema>;

const fetchPost = async (id: string) => {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
};

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

const BlogPostEditorPage = () => {
    const { postId } = useParams<{ postId?: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { adminUser } = useAdminAuth();

    const { data: postData, isLoading: isLoadingPost } = useQuery({
        queryKey: ['admin_blog_post', postId],
        queryFn: () => fetchPost(postId!),
        enabled: !!postId,
    });
    
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
        if (postData) {
            reset({
                title: postData.title,
                slug: postData.slug,
                content: postData.content || '',
                excerpt: postData.excerpt || '',
                featured_image_url: postData.featured_image_url || '',
                is_published: postData.is_published,
            });
        }
    }, [postData, reset]);

    const mutation = useMutation({
        mutationFn: async (data: PostFormValues) => {
            const postObject = {
                ...data,
                author_id: adminUser?.id,
                published_at: data.is_published && !postData?.is_published ? new Date().toISOString() : (data.is_published ? postData?.published_at || new Date().toISOString() : null),
            };

            if (postId) {
                const { error } = await supabase.from('blog_posts').update(postObject).eq('id', postId);
                if (error) throw error;
            } else {
                // For insert, we must ensure the `slug` and `title` properties are correctly
                // passed to satisfy TypeScript's type checking for the 'insert' operation.
                const { title, slug, ...rest } = postObject;
                const insertObject = { title, slug, ...rest };
                const { error } = await supabase.from('blog_posts').insert(insertObject);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            toast.success(postId ? "Post updated successfully!" : "Post created successfully!");
            queryClient.invalidateQueries({ queryKey: ['admin_blog_posts'] });
            queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
            if (postId) {
                queryClient.invalidateQueries({ queryKey: ['admin_blog_post', postId] });
                queryClient.invalidateQueries({ queryKey: ['blog_post', postData?.slug] });
            }
            queryClient.invalidateQueries({ queryKey: ['blog_post'] });
            navigate('/route-aura-booking-admin-page/dashboard/blog');
        },
        onError: (error: any) => {
            toast.error(`Error: ${error.message}`);
        },
    });

    const onSubmit = (data: PostFormValues) => {
        mutation.mutate(data);
    };
    
    if (isLoadingPost) {
        return (
            <div className="p-6 space-y-6 max-w-4xl">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-10 w-32" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">{postId ? 'Edit Post' : 'Create New Post'}</h1>
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
                            <img src={featuredImageUrl} alt="Featured image preview" className="mt-2 rounded-lg max-h-64 w-auto object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')}/>
                        </div>
                    )}
                </div>
                <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea id="excerpt" {...register('excerpt')} placeholder="A short summary of the post..." />
                </div>
                <div>
                    <Label htmlFor="content">Content (HTML supported)</Label>
                    <Textarea id="content" {...register('content')} rows={15} placeholder="Write your post content here. You can use HTML tags like <p>, <ul>, <li>, etc." />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="is_published" checked={watch('is_published')} onCheckedChange={(checked) => setValue('is_published', checked)} />
                    <Label htmlFor="is_published">Publish Post</Label>
                </div>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Saving...' : (postId ? 'Update Post' : 'Create Post')}
                </Button>
            </form>
        </div>
    );
};

export default BlogPostEditorPage;
