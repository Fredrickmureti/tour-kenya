
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotFound from './NotFound';

const fetchPost = async (slug: string) => {
    const { data, error } = await supabase
        .from('blog_posts')
        .select(`
            *,
            blog_categories(name, slug),
            admin_users(name, email, title)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
    
    if (error && error.code !== 'PGRST116') { // Ignore "no rows found"
      throw new Error(error.message);
    }
    return data;
};

const BlogPostPage = () => {
    const { slug } = useParams<{ slug: string }>();

    const { data: post, isLoading } = useQuery({
        queryKey: ['blog_post', slug],
        queryFn: () => fetchPost(slug!),
        enabled: !!slug,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-24 sm:py-32 max-w-4xl">
                <Skeleton className="h-8 w-32 mb-8" />
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <Skeleton className="h-96 w-full mb-8" />
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-5/6 mb-4" />
            </div>
        );
    }

    if (!post) {
        return <NotFound />;
    }

    return (
        <div className="container mx-auto px-4 py-24 sm:py-32 max-w-4xl">
            <Button asChild variant="ghost" className="mb-8">
                <Link to="/blog">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog
                </Link>
            </Button>
            <article>
                <header className="mb-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.blog_categories?.map((cat: any) => (
                            <Badge key={cat.slug} variant="secondary">{cat.name}</Badge>
                        ))}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white lg:text-5xl">
                        {post.title}
                    </h1>
                    <div className="mt-6 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        {post.admin_users && (
                            <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <div>
                                    <span className="font-medium">{post.admin_users.name || post.admin_users.email.split('@')[0]}</span>
                                    {post.admin_users.title && <span className="text-xs block">{post.admin_users.title}</span>}
                                </div>
                            </div>
                        )}
                        <p>
                            Published on {post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : 'N/A'}
                        </p>
                    </div>
                </header>

                {post.featured_image_url && (
                    <img 
                        src={post.featured_image_url} 
                        alt={post.title}
                        className="w-full rounded-lg shadow-lg mb-8 aspect-video object-cover"
                    />
                )}

                <div 
                    className="prose dark:prose-invert max-w-none prose-lg"
                    dangerouslySetInnerHTML={{ __html: post.content || '' }}
                />
            </article>
        </div>
    );
};

export default BlogPostPage;
