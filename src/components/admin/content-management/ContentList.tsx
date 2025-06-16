
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ContentListProps {
  type: string;
  data: any[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const ContentList: React.FC<ContentListProps> = ({ type, data, onEdit, onDelete, onAddNew }) => {
  return (
    <div className="space-y-2">
      <Button onClick={onAddNew} className="mb-4">
        <Plus className="h-4 w-4 mr-2" />
        Add New
      </Button>
      {data.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{item.title || item.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {item.content || item.description || item.bio || `${item.value} ${item.label}` || ''}
                </p>
                {!item.is_active && <span className="text-xs text-red-500">Inactive</span>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContentList;
