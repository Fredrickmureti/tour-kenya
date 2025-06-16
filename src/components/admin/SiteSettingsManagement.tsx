import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BrandingForm from './site-settings/BrandingForm';
import FooterSettingsForm from './site-settings/FooterSettingsForm';
import NavigationLinksManager from './site-settings/NavigationLinksManager';
import AdminProfileForm from './site-settings/AdminProfileForm';

const SiteSettingsManagement: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-gray-600">Manage global site settings and your admin profile.</p>
      </div>

      <Tabs defaultValue="branding">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Site Branding</CardTitle>
            </CardHeader>
            <CardContent>
              <BrandingForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Links</CardTitle>
            </CardHeader>
            <CardContent>
              <NavigationLinksManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <FooterSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>My Admin Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Update your display name and title. This will be shown on blog posts you author.</p>
              <AdminProfileForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteSettingsManagement;
