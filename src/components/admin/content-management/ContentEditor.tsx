
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { ContentType } from './contentOperations';

import AboutContentForm from './forms/AboutContentForm';
import CompanyValuesForm from './forms/CompanyValuesForm';
import HistoryMilestoneForm from './forms/HistoryMilestoneForm';
import TeamMemberForm from './forms/TeamMemberForm';
import CompanyStatisticForm from './forms/CompanyStatisticForm';

interface ContentEditorProps {
  type: ContentType;
  item: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ type, item, onSave, onCancel }) => {
  const [formData, setFormData] = useState(item || {});

  useEffect(() => {
    setFormData(item || {});
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderForm = () => {
    const props = { formData, setFormData };
    switch (type) {
      case 'about_content':
        return <AboutContentForm {...props} />;
      case 'company_values':
        return <CompanyValuesForm {...props} />;
      case 'history_milestones':
        return <HistoryMilestoneForm {...props} />;
      case 'team_members':
        return <TeamMemberForm {...props} />;
      case 'company_statistics':
        return <CompanyStatisticForm {...props} />;
      default:
        return <div>Invalid content type</div>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderForm()}

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active !== false}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ContentEditor;
