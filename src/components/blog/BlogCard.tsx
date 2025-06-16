
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User } from 'lucide-react';

const BlogCard = ({ post }: { post: any }) => {
    return (
        <Card className="flex flex-col h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-0">
                <Link to={`/blog/${post.slug}`}>
                    <img 
                        src={post.featured_image_url || '/placeholder.svg'} 
                        alt={post.title} 
                        className="w-full h-48 object-cover" 
                    />
                </Link>
            </CardHeader>
            <CardContent className="flex-grow p-6">
                <div className="flex flex-wrap gap-2 mb-2">
                    {post.blog_categories?.map((cat: any) => (
                        <Badge key={cat.slug} variant="secondary">{cat.name}</Badge>
                    ))}
                </div>
                <CardTitle className="text-xl font-bold leading-tight">
                    <Link to={`/blog/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {post.title}
                    </Link>
                </CardTitle>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{post.excerpt}</p>
            </CardContent>
            <CardFooter className="p-6 pt-0 text-xs text-gray-500 flex justify-between items-center">
                <p className="flex items-center gap-1.5">
                    <User size={14} />
                    {post.admin_users?.name || 'RouteAura Team'}
                </p>
                <p>{post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : 'N/A'}</p>
            </CardFooter>
        </Card>
    );
};

export default BlogCard;
