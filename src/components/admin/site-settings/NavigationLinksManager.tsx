
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NavLinkList from './NavLinkList';

const NavigationLinksManager = () => {
    const { data: links, isLoading } = useQuery({
        queryKey: ['nav-links-manager'],
        queryFn: async () => {
            const { data, error } = await supabase.from('navigation_links').select('*').order('display_order');
            if (error) throw new Error(error.message);
            return data;
        },
    });

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }

    const headerLinks = links?.filter(l => l.link_type === 'header') || [];
    const footerQuickLinks = links?.filter(l => l.link_type === 'footer_quick') || [];
    const footerLegalLinks = links?.filter(l => l.link_type === 'footer_legal') || [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Header Links</CardTitle>
                    <CardDescription>Manage main navigation links shown in the header.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NavLinkList links={headerLinks} type="header" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Footer - Quick Links</CardTitle>
                    <CardDescription>Manage the list of quick links in the footer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NavLinkList links={footerQuickLinks} type="footer_quick" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Footer - Legal Links</CardTitle>
                    <CardDescription>Manage the legal links like Terms of Service and Privacy Policy.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NavLinkList links={footerLegalLinks} type="footer_legal" />
                </CardContent>
            </Card>
        </div>
    );
};

export default NavigationLinksManager;
