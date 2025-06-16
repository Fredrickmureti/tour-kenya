
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ContentList from './ContentList';
import { ContentType } from './contentOperations';
import type { AboutContent, CompanyValue, HistoryMilestone, TeamMember, CompanyStatistic } from '@/hooks/useAboutContent';

interface ContentData {
  aboutContent: AboutContent[];
  companyValues: CompanyValue[];
  historyMilestones: HistoryMilestone[];
  teamMembers: TeamMember[];
  companyStatistics: CompanyStatistic[];
}

interface ContentTabsProps {
  contentData: ContentData;
  onEdit: (type: ContentType, item: any) => void;
  onDelete: (type: ContentType, id: string) => void;
  onAddNew: (type: ContentType) => void;
}

const TABS_CONFIG = [
  { value: 'about_content', label: 'About Content', title: 'About Content Sections', dataKey: 'aboutContent' },
  { value: 'company_values', label: 'Values', title: 'Company Values', dataKey: 'companyValues' },
  { value: 'history_milestones', label: 'Timeline', title: 'Company Timeline', dataKey: 'historyMilestones' },
  { value: 'team_members', label: 'Team', title: 'Team Members', dataKey: 'teamMembers' },
  { value: 'company_statistics', label: 'Statistics', title: 'Company Statistics', dataKey: 'companyStatistics' },
] as const;


const ContentTabs: React.FC<ContentTabsProps> = ({
  contentData,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <p className="text-gray-600">Manage About Us page content</p>
      </div>

      <Tabs defaultValue="about_content">
        <TabsList className="grid w-full grid-cols-5">
          {TABS_CONFIG.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        {TABS_CONFIG.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card>
              <CardHeader>
                <CardTitle>{tab.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ContentList
                  type={tab.value}
                  data={contentData[tab.dataKey as keyof ContentData]}
                  onEdit={(item) => onEdit(tab.value, item)}
                  onDelete={(id) => onDelete(tab.value, id)}
                  onAddNew={() => onAddNew(tab.value)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ContentTabs;
