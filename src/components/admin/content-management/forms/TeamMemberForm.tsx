
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const TeamMemberForm: React.FC<FormProps> = ({ formData, setFormData }) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          value={formData.role || ''}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
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
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          required
        />
      </div>
    </>
  );
};

export default TeamMemberForm;
