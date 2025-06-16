
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AboutContent {
  id: string;
  section_key: string;
  title: string;
  content: string;
  subtitle?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
}

export interface CompanyValue {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  icon_name?: string;
  is_active: boolean;
  display_order: number;
}

export interface HistoryMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
  is_active: boolean;
  display_order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
}

export interface CompanyStatistic {
  id: string;
  stat_key: string;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
}

export const useAboutContent = () => {
  return useQuery({
    queryKey: ['about-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as AboutContent[];
    }
  });
};

export const useCompanyValues = () => {
  return useQuery({
    queryKey: ['company-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_values')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as CompanyValue[];
    }
  });
};

export const useHistoryMilestones = () => {
  return useQuery({
    queryKey: ['history-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('history_milestones')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as HistoryMilestone[];
    }
  });
};

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as TeamMember[];
    }
  });
};

export const useCompanyStatistics = () => {
  return useQuery({
    queryKey: ['company-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_statistics')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as CompanyStatistic[];
    }
  });
};
