
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BlogCard from '@/components/blog/BlogCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const POSTS_PER_PAGE = 6;

const fetchPosts = async (page: number) => {
    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data, error, count } = await supabase
        .from('blog_posts')
        .select(`
            id,
            title,
            slug,
            excerpt,
            featured_image_url,
            published_at,
            blog_categories (
                name,
                slug
            ),
            admin_users (
                name,
                email
            )
        `, { count: 'exact' })
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(from, to);

    if (error) throw new Error(error.message);
    return { posts: data, count };
};

const BlogPage = () => {
    const [page, setPage] = useState(1);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['blog_posts', page],
        queryFn: () => fetchPosts(page),
    });

    const totalPages = Math.ceil((data?.count || 0) / POSTS_PER_PAGE);

    return (
        <div className="container mx-auto px-4 py-24 sm:py-32">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                    Our Blog
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                    News, insights, and updates from the RouteAura team.
                </p>
            </header>
            
            <main>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                    </div>
                ) : isError || !data?.posts || data.posts.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-semibold">No posts yet!</h2>
                        <p className="text-gray-500 mt-2">Check back later for new articles.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.posts.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </main>

            {totalPages > 1 && (
                <footer className="mt-12">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }}/>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </footer>
            )}
        </div>
    );
};

export default BlogPage;
