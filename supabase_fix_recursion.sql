-- ============================================
-- SCRIPT FIX INFINITE RECURSION
-- Mengatasi error: "infinite recursion detected in policy"
-- ============================================

-- 1. Buat Helper Function (Bypass RLS)
-- Function ini berjalan sebagai "admin" (Security Definer) 
-- sehingga tidak memicu policy recursively saat cek role.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Hapus Policy Bermasalah di User Profiles
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;

-- 3. Buat Ulang Policy dengan Function Aman
CREATE POLICY "Super admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (public.is_super_admin());

-- 4. Fix juga untuk Invitations (Optional tapi recommended)
DROP POLICY IF EXISTS "Super admins can view all invitations" ON public.invitations;

CREATE POLICY "Super admins can view all invitations"
  ON public.invitations FOR ALL
  USING (public.is_super_admin());

-- Selesai!
