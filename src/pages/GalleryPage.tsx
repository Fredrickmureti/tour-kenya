
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GalleryCategory, GalleryImage } from '@/types/gallery';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

const ImageGrid = ({ categoryId }: { categoryId: string }) => {
    const { data: images, isLoading } = useQuery<GalleryImage[]>({
        queryKey: ['gallery_images', categoryId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('gallery_images')
                .select(`*`)
                .eq('category_id', categoryId)
                .eq('is_active', true)
                .order('display_order');

            if (error) throw new Error(error.message);
            return data || [];
        }
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="w-full h-64" />)}
            </div>
        )
    }
    
    if (!images || images.length === 0) {
        return <p>No images found in this category.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
            {images.map(image => (
                <Card key={image.id} className="overflow-hidden group">
                    <div className="aspect-square overflow-hidden">
                        <img src={image.image_url} alt={image.alt_text || image.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <CardContent className="p-4">
                        <h3 className="font-semibold truncate">{image.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{image.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};


const GalleryPage: React.FC = () => {
    const { data: categories, isLoading } = useQuery<GalleryCategory[]>({
        queryKey: ['gallery_categories_public'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('gallery_categories')
                .select('*')
                .eq('is_active', true)
                .order('display_order');
            if (error) throw new Error(error.message);
            return data || [];
        }
    });
    
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 pt-24">
                <Skeleton className="h-12 w-1/4 mb-4" />
                <Skeleton className="h-10 w-full mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="w-full h-64" />)}
                </div>
            </div>
        )
    }

    if (!categories || categories.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 pt-24">
                <h1 className="text-3xl font-bold tracking-tight mb-4">Gallery</h1>
                <p>No gallery categories have been added yet.</p>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8 pt-24">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Our Gallery</h1>
            <p className="text-muted-foreground mb-8">A glimpse into our world. Explore our fleet, facilities, and moments.</p>
            <Tabs defaultValue={categories[0].slug} className="w-full">
                <TabsList>
                    {categories.map(category => (
                         <TabsTrigger key={category.id} value={category.slug}>{category.name}</TabsTrigger>
                    ))}
                </TabsList>

                {categories.map(category => (
                    <TabsContent key={category.id} value={category.slug} className="mt-6">
                        <h2 className="text-2xl font-semibold mb-2">{category.name}</h2>
                        <p className="text-muted-foreground mb-4">{category.description}</p>
                        <ImageGrid categoryId={category.id} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default GalleryPage;
