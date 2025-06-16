
import { supabase } from '@/integrations/supabase/client';

export type ContentType = 'about_content' | 'company_values' | 'history_milestones' | 'team_members' | 'company_statistics';

export const saveContent = async (type: ContentType, data: any, editingItem: any) => {
  const dataToUpdate = { ...data };

  if (editingItem?.id) {
    // Update existing item
    // Ensure created_by is not overwritten on update
    delete dataToUpdate.created_by;
    const { data: updateData, error } = await supabase.from(type).update(dataToUpdate).eq('id', editingItem.id).select();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(error.message);
    }
    
    // If Supabase returns an empty array (e.g., no change), return the submitted data merged with the original item.
    // This helps the optimistic update logic have a complete item to work with.
    return updateData?.[0] || { ...editingItem, ...dataToUpdate };

  } else {
    // Create new item
    const { error, data: insertedData } = await supabase.from(type).insert([dataToUpdate]).select();
    
    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(error.message);
    }
    if (!insertedData || insertedData.length === 0) {
      throw new Error("Creation failed, no data returned.");
    }
    return insertedData[0];
  }
};

export const deleteContent = async (type: ContentType, id: string) => {
  const { data, error } = await supabase.from(type).delete().eq('id', id).select();

  if (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }
  
  // The RLS policy might prevent deletion and return an empty array if not a superadmin.
  // We throw an error here to be caught by the mutation's onError.
  if (!data || data.length === 0) {
    throw new Error('Delete failed. You may not have the required permissions.');
  }

  return data[0];
};
