-- ================================================================
-- FIX THEME RLS POLICIES
-- ================================================================

-- 1. Ensure RLS is enabled
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- 2. Allow public to view active themes
DROP POLICY IF EXISTS "Public can view active themes" ON public.themes;
CREATE POLICY "Public can view active themes" ON public.themes 
FOR SELECT USING (is_active = TRUE);

-- 3. Allow Super Admins to manage ALL themes (CRUD)
DROP POLICY IF EXISTS "Super admins can manage themes" ON public.themes;
CREATE POLICY "Super admins can manage themes" ON public.themes
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- 4. Set storage policies for theme thumbnails (in case not applied)
-- Allow public to read
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'theme-thumbnails');

-- Allow authenticated (admin) to manage
DROP POLICY IF EXISTS "Admin Manage" ON storage.objects;
CREATE POLICY "Admin Manage" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'theme-thumbnails');
