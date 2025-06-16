
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const FooterSettingsForm = () => {
    const queryClient = useQueryClient();
    const [formState, setFormState] = useState({
        about_us_text: '',
        contact_address: '',
        contact_phone: '',
        contact_email: '',
        social_facebook_url: '',
        social_twitter_url: '',
        social_instagram_url: '',
        social_youtube_url: '',
        newsletter_enabled: true,
        copyright_text: '',
    });

    const { data, isLoading } = useQuery({
        queryKey: ['footer-settings-form'],
        queryFn: async () => {
            const { data, error } = await supabase.from('footer_settings').select('*').eq('id', 1).single();
            if (error) throw new Error(error.message);
            return data;
        },
    });

    useEffect(() => {
        if (data) {
            setFormState({
                about_us_text: data.about_us_text || '',
                contact_address: data.contact_address || '',
                contact_phone: data.contact_phone || '',
                contact_email: data.contact_email || '',
                social_facebook_url: data.social_facebook_url || '',
                social_twitter_url: data.social_twitter_url || '',
                social_instagram_url: data.social_instagram_url || '',
                social_youtube_url: data.social_youtube_url || '',
                newsletter_enabled: data.newsletter_enabled,
                copyright_text: data.copyright_text || '',
            });
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (updatedData: typeof formState) => {
            const { error } = await supabase.from('footer_settings').update(updatedData).eq('id', 1);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            toast.success('Footer settings updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['site-settings'] });
            queryClient.invalidateQueries({ queryKey: ['footer-settings-form'] });
        },
        onError: (error) => {
            toast.error(`Failed to update footer settings: ${error.message}`);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormState(prev => ({ ...prev, newsletter_enabled: checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formState);
    };

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Label htmlFor="about_us_text">About Us Text</Label>
                <Textarea id="about_us_text" value={formState.about_us_text} onChange={handleChange} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="contact_address">Contact Address</Label>
                    <Input id="contact_address" value={formState.contact_address} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input id="contact_phone" value={formState.contact_phone} onChange={handleChange} />
                </div>
                 <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input id="contact_email" type="email" value={formState.contact_email} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="copyright_text">Copyright Text</Label>
                    <Input id="copyright_text" value={formState.copyright_text} onChange={handleChange} />
                </div>
            </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <Label htmlFor="social_facebook_url">Facebook URL</Label>
                    <Input id="social_facebook_url" value={formState.social_facebook_url} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="social_twitter_url">Twitter URL</Label>
                    <Input id="social_twitter_url" value={formState.social_twitter_url} onChange={handleChange} />
                </div>
                 <div>
                    <Label htmlFor="social_instagram_url">Instagram URL</Label>
                    <Input id="social_instagram_url" value={formState.social_instagram_url} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="social_youtube_url">YouTube URL</Label>
                    <Input id="social_youtube_url" value={formState.social_youtube_url} onChange={handleChange} />
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="newsletter_enabled" checked={formState.newsletter_enabled} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="newsletter_enabled">Enable Newsletter Signup</Label>
            </div>
            <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Footer Settings'}
            </Button>
        </form>
    );
};

export default FooterSettingsForm;
