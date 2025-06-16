
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const HistoryMilestoneForm: React.FC<FormProps> = ({ formData, setFormData }) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order ?? 0}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="year">Year</Label>
        <Input
          id="year"
          value={formData.year || ''}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
        />
      </div>
    </>
  );
};

export default HistoryMilestoneForm;
