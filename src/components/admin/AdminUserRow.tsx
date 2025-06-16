
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Edit, Trash2 } from 'lucide-react';
import { AdminCredentialsDialog } from './AdminCredentialsDialog';

interface AdminUserWithAuth {
  user_id: string;
  email: string;
  created_at: string;
  is_superadmin?: boolean;
  updated_at?: string;
  branch_id?: string | null;
  branch_name?: string | null;
  is_active?: boolean;
}

interface AdminUserRowProps {
  admin: AdminUserWithAuth;
  isCreatorSuperAdmin: boolean;
  currentAdminId?: string;
  onEdit: (admin: AdminUserWithAuth) => void;
  onDelete: (adminId: string, email: string) => void;
  isDeleting: boolean;
}

export const AdminUserRow: React.FC<AdminUserRowProps> = ({
  admin,
  isCreatorSuperAdmin,
  currentAdminId,
  onEdit,
  onDelete,
  isDeleting
}) => {
  return (
    <TableRow key={admin.user_id}>
      <TableCell className="font-medium">{admin.email}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {admin.is_superadmin ? (
            <Badge className="bg-purple-500 text-white flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Super Admin
            </Badge>
          ) : (
            <Badge variant="secondary">
              Branch Admin
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {admin.is_superadmin ? 'N/A' : admin.branch_name || 'Not Assigned'}
      </TableCell>
      <TableCell>
        <Badge variant={admin.is_active ? "default" : "destructive"}>
          {admin.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
        {admin.updated_at ? new Date(admin.updated_at).toLocaleDateString() : 'Never'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <AdminCredentialsDialog 
            email={admin.email}
            password="Contact admin for password"
          />
          
          {isCreatorSuperAdmin && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(admin)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              
              {admin.user_id !== currentAdminId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(admin.user_id, admin.email)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
