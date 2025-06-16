
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Palette } from 'lucide-react';
import { ReceiptTemplateManager } from './ReceiptTemplateManager';

export const ReceiptTemplateManagementTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Palette className="h-6 w-6 text-purple-600" />
            <div>
              <CardTitle>Receipt Template Management</CardTitle>
              <CardDescription>
                Customize your receipt templates, branding, and design elements to create professional receipts that reflect your brand identity.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ReceiptTemplateManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptTemplateManagementTab;
