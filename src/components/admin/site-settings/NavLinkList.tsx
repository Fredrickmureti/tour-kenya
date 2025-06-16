
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import NavLinkForm from './NavLinkForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NavLinkListProps {
    links: any[];
    type: 'header' | 'footer_quick' | 'footer_legal';
}

const NavLinkList: React.FC<NavLinkListProps> = ({ links, type }) => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<any | null>(null);

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('navigation_links').delete().eq('id', id);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            toast.success('Link deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['site-settings'] });
            queryClient.invalidateQueries({ queryKey: ['nav-links-manager'] });
        },
        onError: (error) => toast.error(`Deletion failed: ${error.message}`)
    });

    const handleAddNew = () => {
        setEditingLink(null);
        setIsFormOpen(true);
    };

    const handleEdit = (link: any) => {
        setEditingLink(link);
        setIsFormOpen(true);
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={handleAddNew}><Plus className="h-4 w-4 mr-2" />Add New Link</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Text</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {links.map(link => (
                        <TableRow key={link.id}>
                            <TableCell>{link.text}</TableCell>
                            <TableCell>{link.href}</TableCell>
                            <TableCell>{link.display_order}</TableCell>
                            <TableCell>{link.is_active ? 'Yes' : 'No'}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(link)}><Edit className="h-4 w-4" /></Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the link "{link.text}". This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteMutation.mutate(link.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             <NavLinkForm
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                linkData={editingLink}
                linkType={type}
            />
        </div>
    );
};

export default NavLinkList;
