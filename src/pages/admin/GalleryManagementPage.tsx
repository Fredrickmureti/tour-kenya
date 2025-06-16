
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CategoryManager from '@/components/admin/gallery/CategoryManager';

const GalleryManagementPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gallery Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Create and manage gallery categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryManagementPage;
