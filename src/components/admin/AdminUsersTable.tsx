
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminUserRow } from './AdminUserRow';

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

interface AdminUsersTableProps {
  adminUsers: AdminUserWithAuth[];
  isCreatorSuperAdmin: boolean;
  currentAdminId?: string;
  onEdit: (admin: AdminUserWithAuth) => void;
  onDelete: (adminId: string, email: string) => void;
  isDeleting: boolean;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  adminUsers,
  isCreatorSuperAdmin,
  currentAdminId,
  onEdit,
  onDelete,
  isDeleting
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Assigned Branch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adminUsers.map((admin) => (
            <AdminUserRow
              key={admin.user_id}
              admin={admin}
              isCreatorSuperAdmin={isCreatorSuperAdmin}
              currentAdminId={currentAdminId}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
