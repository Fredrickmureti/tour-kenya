
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AboutContent, CompanyValue, HistoryMilestone, TeamMember, CompanyStatistic } from '@/hooks/useAboutContent';

// Admin hook to fetch ALL about content, regardless of active status
export const useAdminAboutContent = () => {
  return useQuery({
    queryKey: ['admin-about-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Error fetching admin about content:', error);
        throw error;
      }
      return data as AboutContent[];
    },
  });
};

// Admin hook to fetch ALL company values
export const useAdminCompanyValues = () => {
  return useQuery({
    queryKey: ['admin-company-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_values')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Error fetching admin company values:', error);
        throw error;
      }
      return data as CompanyValue[];
    },
  });
};

// Admin hook to fetch ALL history milestones
export const useAdminHistoryMilestones = () => {
  return useQuery({
    queryKey: ['admin-history-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('history_milestones')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Error fetching admin history milestones:', error);
        throw error;
      }
      return data as HistoryMilestone[];
    },
  });
};

// Admin hook to fetch ALL team members
export const useAdminTeamMembers = () => {
  return useQuery({
    queryKey: ['admin-team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Error fetching admin team members:', error);
        throw error;
      }
      return data as TeamMember[];
    },
  });
};

// Admin hook to fetch ALL company statistics
export const useAdminCompanyStatistics = () => {
  return useQuery({
    queryKey: ['admin-company-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_statistics')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Error fetching admin company statistics:', error);
        throw error;
      }
      return data as CompanyStatistic[];
    },
  });
};
