-- ================================================================
-- ADD ASSIGNED THEME COLUMN TO USER_PROFILES
-- ================================================================
-- This migration adds the ability for admins to assign themes to users

BEGIN;

-- Add assigned_theme_id column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS assigned_theme_id UUID REFERENCES public.themes(id) ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.assigned_theme_id IS 'The theme assigned by admin to this user. If null, user can select any theme.';

-- Update timestamp
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update RLS policy to allow admins to update assigned_theme_id
DROP POLICY IF EXISTS "Admins can view and update all user profiles" ON public.user_profiles;

CREATE POLICY "Admins can view and update all user profiles" 
  ON public.user_profiles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

COMMIT;
