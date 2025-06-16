
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ContentEditor from './ContentEditor';
import { ContentType } from './contentOperations';

interface ContentFormWrapperProps {
  editingItem: any;
  editingType: ContentType;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ContentFormWrapper: React.FC<ContentFormWrapperProps> = ({
  editingItem,
  editingType,
  onSave,
  onCancel,
}) => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingItem.id ? 'Edit' : 'Add'} {editingType.replace(/_/g, ' ')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentEditor
            type={editingType}
            item={editingItem}
            onSave={onSave}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentFormWrapper;
