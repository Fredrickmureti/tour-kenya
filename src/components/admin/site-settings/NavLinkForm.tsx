
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface NavLinkFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    linkData?: any | null;
    linkType: string;
}

const NavLinkForm: React.FC<NavLinkFormProps> = ({ isOpen, onOpenChange, linkData, linkType }) => {
    const queryClient = useQueryClient();
    const [formState, setFormState] = useState({
        text: '',
        href: '',
        display_order: 0,
        is_active: true,
    });

    useEffect(() => {
        if (linkData) {
            setFormState({
                text: linkData.text || '',
                href: linkData.href || '',
                display_order: linkData.display_order || 0,
                is_active: linkData.is_active,
            });
        } else {
            setFormState({ text: '', href: '', display_order: 0, is_active: true });
        }
    }, [linkData, isOpen]);

    const mutation = useMutation({
        mutationFn: async (newLinkData: any) => {
            if (linkData?.id) {
                // Update
                const { error } = await supabase.from('navigation_links').update(newLinkData).eq('id', linkData.id);
                if (error) throw new Error(error.message);
            } else {
                // Create
                const { error } = await supabase.from('navigation_links').insert([{ ...newLinkData, link_type: linkType }]);
                if (error) throw new Error(error.message);
            }
        },
        onSuccess: () => {
            toast.success(`Link ${linkData?.id ? 'updated' : 'created'} successfully!`);
            queryClient.invalidateQueries({ queryKey: ['site-settings'] });
            queryClient.invalidateQueries({ queryKey: ['nav-links-manager'] });
            onOpenChange(false);
        },
        onError: (error) => toast.error(`Failed: ${error.message}`),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formState);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{linkData?.id ? 'Edit' : 'Add'} Navigation Link</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the navigation link.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="text">Link Text</Label>
                        <Input id="text" value={formState.text} onChange={e => setFormState(p => ({...p, text: e.target.value}))} required />
                    </div>
                    <div>
                        <Label htmlFor="href">URL (e.g., /about)</Label>
                        <Input id="href" value={formState.href} onChange={e => setFormState(p => ({...p, href: e.target.value}))} required />
                    </div>
                    <div>
                        <Label htmlFor="display_order">Display Order</Label>
                        <Input id="display_order" type="number" value={formState.display_order} onChange={e => setFormState(p => ({...p, display_order: parseInt(e.target.value)}))} required />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="is_active" checked={formState.is_active} onCheckedChange={c => setFormState(p => ({...p, is_active: c}))} />
                        <Label htmlFor="is_active">Active</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving...' : 'Save Link'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default NavLinkForm;
