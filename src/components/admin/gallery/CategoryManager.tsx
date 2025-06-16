
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GalleryCategory } from '@/types/gallery';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CategoryForm from './CategoryForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';

const CategoryManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null);

    const { data: categories, isLoading } = useQuery<GalleryCategory[]>({
        queryKey: ['gallery_categories_admin'],
        queryFn: async () => {
            const { data, error } = await supabase.from('gallery_categories').select('*').order('display_order');
            if (error) throw new Error(error.message);
            return data || [];
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            toast.success('Category deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['gallery_categories_admin'] });
        },
        onError: (error) => {
            toast.error(`Error deleting category: ${error.message}`);
        }
    });

    const handleAddNew = () => {
        setEditingCategory(null);
        setFormOpen(true);
    };

    const handleEdit = (category: GalleryCategory) => {
        setEditingCategory(category);
        setFormOpen(true);
    };

    if (isLoading) return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Category
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories?.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>{category.slug}</TableCell>
                            <TableCell>{category.display_order}</TableCell>
                            <TableCell>{category.is_active ? 'Yes' : 'No'}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the category and all images within it.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteMutation.mutate(category.id)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <CategoryForm
                isOpen={isFormOpen}
                onOpenChange={setFormOpen}
                category={editingCategory}
            />
        </div>
    );
};

export default CategoryManager;
