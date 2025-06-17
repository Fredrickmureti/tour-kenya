
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { PostForm } from '@/components/admin/blog/PostForm';

const fetchPost = async (id: string) => {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

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

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const postObject = {
        ...data,
        author_id: adminUser?.id,
        published_at: data.is_published && !postData?.is_published ? new Date().toISOString() : (data.is_published ? postData?.published_at || new Date().toISOString() : null),
      };

      if (postId) {
        const { error } = await supabase.from('blog_posts').update(postObject).eq('id', postId);
        if (error) throw error;
      } else {
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
      <PostForm
        initialData={postData}
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
        isEdit={!!postId}
      />
    </div>
  );
};

export default BlogPostEditorPage;
