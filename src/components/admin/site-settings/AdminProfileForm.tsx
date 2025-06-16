
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const AdminProfileForm = () => {
    const queryClient = useQueryClient();
    const { adminUser } = useAdminAuth();
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');

    const { data: profile, isLoading } = useQuery({
        queryKey: ['admin-profile', adminUser?.id],
        queryFn: async () => {
            if (!adminUser?.id) return null;
            const { data, error } = await supabase.from('admin_users').select('name, title').eq('user_id', adminUser.id).single();
            if (error) throw new Error(error.message);
            return data;
        },
        enabled: !!adminUser?.id,
    });

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setTitle(profile.title || '');
        }
    }, [profile]);

    const mutation = useMutation({
        mutationFn: async (updatedData: { name: string, title: string }) => {
            if (!adminUser?.id) throw new Error("User not authenticated");
            const { error } = await supabase.from('admin_users').update(updatedData).eq('user_id', adminUser.id);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            toast.success('Profile updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['admin-profile', adminUser?.id] });
            // Invalidate other queries that might use admin name/title
            queryClient.invalidateQueries({ queryKey: ['admin_blog_posts'] });
            queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
            queryClient.invalidateQueries({ queryKey: ['blog_post'] });

        },
        onError: (error: Error) => {
            toast.error(`Failed to update profile: ${error.message}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ name, title });
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-24" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="adminName">Full Name</Label>
                <Input id="adminName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Jane Doe" />
            </div>
            <div>
                <Label htmlFor="adminTitle">Job Title</Label>
                <Input id="adminTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Editor, Content Manager" />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
        </form>
    );
};

export default AdminProfileForm;
