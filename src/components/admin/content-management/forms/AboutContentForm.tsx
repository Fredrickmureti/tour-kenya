
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const AboutContentForm: React.FC<FormProps> = ({ formData, setFormData }) => {
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
        <Label htmlFor="section_key">Section Key</Label>
        <Input
          id="section_key"
          value={formData.section_key || ''}
          onChange={(e) => setFormData({ ...formData, section_key: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={formData.subtitle || ''}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          value={formData.image_url || ''}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content || ''}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          required
        />
      </div>
    </>
  );
};

export default AboutContentForm;
