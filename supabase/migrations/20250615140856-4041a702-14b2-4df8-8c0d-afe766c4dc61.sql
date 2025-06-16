
-- Update RLS policy for about_content
DROP POLICY IF EXISTS "Superadmins can manage about content" ON public.about_content;
CREATE POLICY "Superadmins can manage about content" ON public.about_content
  FOR ALL
  USING (is_current_user_superadmin())
  WITH CHECK (is_current_user_superadmin());

-- Update RLS policy for company_values
DROP POLICY IF EXISTS "Superadmins can manage company values" ON public.company_values;
CREATE POLICY "Superadmins can manage company values" ON public.company_values
  FOR ALL
  USING (is_current_user_superadmin())
  WITH CHECK (is_current_user_superadmin());

-- Update RLS policy for history_milestones
DROP POLICY IF EXISTS "Superadmins can manage history milestones" ON public.history_milestones;
CREATE POLICY "Superadmins can manage history milestones" ON public.history_milestones
  FOR ALL
  USING (is_current_user_superadmin())
  WITH CHECK (is_current_user_superadmin());

-- Update RLS policy for team_members
DROP POLICY IF EXISTS "Superadmins can manage team members" ON public.team_members;
CREATE POLICY "Superadmins can manage team members" ON public.team_members
  FOR ALL
  USING (is_current_user_superadmin())
  WITH CHECK (is_current_user_superadmin());

-- Update RLS policy for company_statistics
DROP POLICY IF EXISTS "Superadmins can manage company statistics" ON public.company_statistics;
CREATE POLICY "Superadmins can manage company statistics" ON public.company_statistics
  FOR ALL
  USING (is_current_user_superadmin())
  WITH CHECK (is_current_user_superadmin());
