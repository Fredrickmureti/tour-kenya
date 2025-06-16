
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const CompanyStatisticForm: React.FC<FormProps> = ({ formData, setFormData }) => {
  return (
    <>
       <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={formData.label || ''}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
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
        <Label htmlFor="stat_key">Stat Key</Label>
        <Input
          id="stat_key"
          value={formData.stat_key || ''}
          onChange={(e) => setFormData({ ...formData, stat_key: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="value">Value</Label>
        <Input
          id="value"
          value={formData.value || ''}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          required
        />
      </div>
    </>
  );
};

export default CompanyStatisticForm;
