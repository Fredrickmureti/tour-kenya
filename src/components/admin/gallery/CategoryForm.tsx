
import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GalleryCategory } from '@/types/gallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CategoryFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    category: GalleryCategory | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ isOpen, onOpenChange, category }) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (category) {
            setName(category.name);
            setSlug(category.slug);
            setDescription(category.description || '');
            setDisplayOrder(category.display_order);
            setIsActive(category.is_active);
        } else {
            setName('');
            setSlug('');
            setDescription('');
            setDisplayOrder(0);
            setIsActive(true);
        }
    }, [category, isOpen]);
    
    const mutation = useMutation({
        mutationFn: async (formData: Omit<GalleryCategory, 'id' | 'created_at'>) => {
            if (category) {
                const { error } = await supabase.from('gallery_categories').update(formData).eq('id', category.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('gallery_categories').insert([formData]);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            toast.success(`Category ${category ? 'updated' : 'created'} successfully!`);
            queryClient.invalidateQueries({ queryKey: ['gallery_categories_admin'] });
            queryClient.invalidateQueries({ queryKey: ['gallery_categories_public'] });
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        if (!finalSlug) {
            toast.error("Name or slug must be provided to generate a valid slug.");
            return;
        }
        const formData = {
            name,
            slug: finalSlug,
            description,
            display_order: displayOrder,
            is_active: isActive,
        };
        mutation.mutate(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{category ? 'Edit' : 'Add'} Category</DialogTitle>
                    <DialogDescription>Fill out the details for the gallery category.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (URL-friendly name)</Label>
                        <Input id="slug" value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated if left blank" />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="display_order">Display Order</Label>
                        <Input id="display_order" type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} required />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                        <Label htmlFor="is_active">Active</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving...' : 'Save Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryForm;
