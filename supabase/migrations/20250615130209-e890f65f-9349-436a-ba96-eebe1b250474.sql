
-- Add a 'title' column to the admin_users table to store the job title.
ALTER TABLE public.admin_users ADD COLUMN title TEXT;

-- Add a comment to describe the purpose of the new column.
COMMENT ON COLUMN public.admin_users.title IS 'The job title of the admin user, e.g., "Editor", "Content Manager".';

