
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReceiptTemplate {
  id: string;
  template_name: string;
  company_name: string;
  company_tagline: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_gradient: string;
  header_font: string;
  body_font: string;
  header_style: string;
  show_qr_code: boolean;
  show_fleet_details: boolean;
  show_weather_info: boolean;
  header_message?: string;
  footer_message: string;
  terms_and_conditions?: string;
  promotional_message?: string;
  logo_url?: string;
  support_phone?: string;
  support_email?: string;
  website_url?: string;
  branch_id?: string;
}

export const useReceiptTemplate = (branchId?: string) => {
  return useQuery({
    queryKey: ['receipt-template', branchId],
    queryFn: async (): Promise<ReceiptTemplate> => {
      const { data, error } = await supabase.rpc('get_receipt_template', {
        p_branch_id: branchId || null
      });

      if (error) {
        console.error('Error fetching receipt template:', error);
        // Return default template
        return {
          id: 'default',
          template_name: 'Default Template',
          company_name: 'RouteAura Bus Services',
          company_tagline: 'Your Trusted Travel Partner',
          primary_color: '#2563eb',
          secondary_color: '#16a34a',
          accent_color: '#dc2626',
          background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          header_font: 'Inter',
          body_font: 'Inter',
          header_style: 'gradient',
          show_qr_code: true,
          show_fleet_details: true,
          show_weather_info: false,
          footer_message: 'Thank you for choosing our services!'
        };
      }

      return (data as unknown as ReceiptTemplate) || {
        id: 'default',
        template_name: 'Default Template',
        company_name: 'RouteAura Bus Services',
        company_tagline: 'Your Trusted Travel Partner',
        primary_color: '#2563eb',
        secondary_color: '#16a34a',
        accent_color: '#dc2626',
        background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        header_font: 'Inter',
        body_font: 'Inter',
        header_style: 'gradient',
        show_qr_code: true,
        show_fleet_details: true,
        show_weather_info: false,
        footer_message: 'Thank you for choosing our services!'
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in newer versions)
  });
};
