
import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import { 
  useAdminAboutContent,
  useAdminCompanyValues, 
  useAdminHistoryMilestones, 
  useAdminTeamMembers, 
  useAdminCompanyStatistics
} from '@/hooks/useAdminAboutContent';
import { ContentType } from './content-management/contentOperations';
import { useContentMutations } from '@/hooks/useContentMutations';
import ContentFormWrapper from './content-management/ContentFormWrapper';
import ContentTabs from './content-management/ContentTabs';

const ContentManagement: React.FC = () => {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<ContentType | ''>('');
  const { silentRefreshSession } = useAdminAuth();

  const { data: aboutContent = [] } = useAdminAboutContent();
  const { data: companyValues = [] } = useAdminCompanyValues();
  const { data: historyMilestones = [] } = useAdminHistoryMilestones();
  const { data: teamMembers = [] } = useAdminTeamMembers();
  const { data: companyStatistics = [] } = useAdminCompanyStatistics();
  
  const handleCancel = () => {
    setEditingItem(null);
    setEditingType('');
  };

  const { saveMutation, deleteMutation } = useContentMutations({
    onSuccess: handleCancel,
    onCancel: handleCancel,
  });

  const handleSave = async (data: any) => {
    if (!editingType) return;
    if (silentRefreshSession) {
      const refreshed = await silentRefreshSession();
      if (!refreshed) {
        toast.error("Failed to refresh admin session. Please log in again.");
        return;
      }
    }
    
    saveMutation({ type: editingType, data, item: editingItem });
  };

  const handleDelete = async (type: ContentType, id: string) => {
    if (silentRefreshSession) {
      const refreshed = await silentRefreshSession();
      if (!refreshed) {
        toast.error("Failed to refresh admin session. Please log in again.");
        return;
      }
    }
    deleteMutation({ type, id });
  };

  const handleEdit = (type: ContentType, item: any) => {
    setEditingItem(item);
    setEditingType(type);
  };

  const handleAddNew = (type: ContentType) => {
    setEditingItem({});
    setEditingType(type);
  };


  if (editingItem && editingType) {
    return (
      <ContentFormWrapper
        editingItem={editingItem}
        editingType={editingType}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  const contentData = {
    aboutContent,
    companyValues,
    historyMilestones,
    teamMembers,
    companyStatistics,
  };

  return (
    <ContentTabs
      contentData={contentData}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAddNew={handleAddNew}
    />
  );
};

export default ContentManagement;
