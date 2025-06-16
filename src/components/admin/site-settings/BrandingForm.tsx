
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const BrandingForm = () => {
    const queryClient = useQueryClient();
    const [companyName, setCompanyName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const { data: branding, isLoading } = useQuery({
        queryKey: ['site-branding-form'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_branding').select('*').eq('id', 1).maybeSingle();
            if (error && error.code !== 'PGRST116') { // PGRST116: no rows found, which is ok
                throw new Error(error.message);
            }
            return data;
        },
    });

    useEffect(() => {
        if (branding) {
            setCompanyName(branding.company_name || '');
            setLogoUrl(branding.logo_url || '');
        }
    }, [branding]);

    const mutation = useMutation({
        mutationFn: async (updatedData: { company_name: string, logo_url: string }) => {
            const { error } = await supabase
                .from('site_branding')
                .update(updatedData)
                .eq('id', 1);
            
            if (error) {
                console.error("Error updating branding:", error);
                throw new Error(error.message);
            }
            return null;
        },
        onSuccess: () => {
            toast.success('Branding updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['site-settings'] });
            queryClient.invalidateQueries({ queryKey: ['site-branding-form'] });
        },
        onError: (error) => {
            toast.error(`Failed to update branding: ${error.message}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (logoUrl && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(logoUrl)) {
            toast.error("Please enter a valid URL for the logo.");
            return;
        }
        mutation.mutate({ company_name: companyName, logo_url: logoUrl });
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
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Branding'}
            </Button>
        </form>
    );
};

export default BrandingForm;
