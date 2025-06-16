
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { saveContent, deleteContent, ContentType } from '@/components/admin/content-management/contentOperations';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface UseContentMutationsProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const useContentMutations = ({ onSuccess, onCancel }: UseContentMutationsProps) => {
  const queryClient = useQueryClient();
  const { adminUser } = useAdminAuth();

  const { mutate: saveMutation } = useMutation({
    mutationFn: ({ type, data, item }: { type: ContentType, data: any, item: any }) => {
      const dataToSave = { ...data };
      if (!item?.id && adminUser) {
        dataToSave.created_by = adminUser.id;
      }
      return saveContent(type, dataToSave, item);
    },
    onMutate: async ({ type, data, item }) => {
      const queryKey = [`admin-${type.replace(/_/g, '-')}`];
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);
      let tempId: string | undefined;

      queryClient.setQueryData(queryKey, (oldData: any[] | undefined) => {
        if (!oldData) return [];
        if (item.id) { // Update
          return oldData.map(d => d.id === item.id ? { ...d, ...data } : d);
        } else { // Create
          tempId = `temp-${Date.now()}`;
          return [...oldData, { ...data, id: tempId, created_by: adminUser?.id }];
        }
      });

      return { previousData, queryKey, tempId };
    },
    onError: (err: Error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast.error(`Failed to save: ${err.message}`);
      onCancel();
    },
    onSuccess: (newItemData, variables, context) => {
      queryClient.setQueryData(context.queryKey, (oldData: any[] | undefined) => {
        if (!oldData) return [newItemData];
        if (context?.tempId) { // Was a creation
          return oldData.map(d => d.id === context.tempId ? newItemData : d);
        } else { // Was an update
          return oldData.map(d => d.id === newItemData.id ? newItemData : d);
        }
      });
      toast.success("Content saved successfully!");
      onSuccess();
    },
    onSettled: (data, error, variables) => {
      const publicQueryKey = [variables.type.replace(/_/g, '-')];
      queryClient.invalidateQueries({ queryKey: publicQueryKey });
    },
  });

  const { mutate: deleteMutation } = useMutation({
    mutationFn: ({ type, id }: { type: ContentType, id: string }) => deleteContent(type, id),
    onMutate: async ({ type, id }) => {
      const queryKey = [`admin-${type.replace(/_/g, '-')}`];
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (oldData: any[] | undefined) => 
        oldData?.filter(d => d.id !== id) || []
      );
      return { previousData, queryKey };
    },
    onError: (err: Error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast.error(`Failed to delete: ${err.message}`);
    },
    onSuccess: () => {
      toast.success("Content deleted successfully.");
    },
    onSettled: (data, error, variables) => {
      const publicQueryKey = [variables.type.replace(/_/g, '-')];
      queryClient.invalidateQueries({ queryKey: publicQueryKey });
    }
  });

  return { saveMutation, deleteMutation };
};
