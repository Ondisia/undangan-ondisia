-- ============================================
-- SCRIPT SET SUPER ADMIN
-- Ganti 'email_anda@gmail.com' dengan email login Anda
-- ============================================

UPDATE public.user_profiles
SET role = 'super_admin'
WHERE email = 'ondisia.id@gmail.com'; -- <== GANTI INI

-- Cek apakah berhasil
SELECT email, role FROM public.user_profiles WHERE role = 'super_admin';
