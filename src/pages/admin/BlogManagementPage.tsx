import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const fetchPosts = async () => {
    const { data, error } = await supabase
        .from('blog_posts')
        .select(`*, admin_users(name, email)`)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const BlogManagementPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { data: posts, isLoading } = useQuery({ queryKey: ['admin_blog_posts'], queryFn: fetchPosts });

    const togglePublishMutation = useMutation({
        mutationFn: async ({ id, is_published }: { id: string, is_published: boolean }) => {
            const { error } = await supabase
                .from('blog_posts')
                .update({ is_published, published_at: is_published ? new Date().toISOString() : null })
                .eq('id', id);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            toast.success("Post status updated!");
            queryClient.invalidateQueries({ queryKey: ['admin_blog_posts'] });
            queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
        },
        onError: (error) => toast.error(error.message)
    });

    const deletePostMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('blog_posts').delete().eq('id', id);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            toast.success("Post deleted!");
            queryClient.invalidateQueries({ queryKey: ['admin_blog_posts'] });
            queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
        },
        onError: (error) => toast.error(error.message)
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Blog Management</h1>
                <Button onClick={() => navigate('/route-aura-booking-admin-page/dashboard/blog/new')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> New Post
                </Button>
            </div>

            <div className="bg-card rounded-lg shadow border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Published At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            posts?.map((post: any) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell>{post.admin_users?.name || post.admin_users?.email || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={post.is_published ? 'default' : 'secondary'}>
                                            {post.is_published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {post.published_at ? format(new Date(post.published_at), 'PPp') : 'Not published'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Switch
                                                aria-label="Publish"
                                                checked={post.is_published}
                                                onCheckedChange={(checked) => togglePublishMutation.mutate({ id: post.id, is_published: checked })}
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/route-aura-booking-admin-page/dashboard/blog/edit/${post.id}`)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => deletePostMutation.mutate(post.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default BlogManagementPage;
