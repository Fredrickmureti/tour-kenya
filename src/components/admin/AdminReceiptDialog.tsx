
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import AdminReceiptViewer from './AdminReceiptViewer';

interface AdminReceiptDialogProps {
  receiptId: string;
  children?: React.ReactNode;
}

const AdminReceiptDialog: React.FC<AdminReceiptDialogProps> = ({ 
  receiptId, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Receipt Details</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            View receipt information and details
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <AdminReceiptViewer 
            receiptId={receiptId} 
            onBack={() => setIsOpen(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminReceiptDialog;
