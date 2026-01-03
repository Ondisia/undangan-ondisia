-- ================================================================
-- ULTIMATE REPAIR SCRIPT (Jalankan ini di Supabase SQL Editor)
-- ================================================================

-- 1. Pastikan kolom 'slug' ada di tabel themes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='themes' AND column_name='slug') THEN
        ALTER TABLE public.themes ADD COLUMN slug TEXT;
    END IF;
END $$;

-- 2. Matikan RLS sementara untuk perbaikan
ALTER TABLE public.themes DISABLE ROW LEVEL SECURITY;

-- 3. Hapus SEMUA policy lama agar tidak bentrok
DROP POLICY IF EXISTS "Public can view active themes" ON public.themes;
DROP POLICY IF EXISTS "Super admins can manage themes" ON public.themes;
DROP POLICY IF EXISTS "Public Access" ON public.themes;
DROP POLICY IF EXISTS "Admin Manage" ON public.themes;

-- 4. Nyalakan kembali RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- 5. Buat Policy Baru yang Lebih Sederhana & Kuat
-- Izinkan SEMUA ORANG melihat tema (penting untuk preview & publik)
CREATE POLICY "Enable read access for all users" 
ON public.themes FOR SELECT 
USING (true);

-- Izinkan Super Admin melakukan segalanya
CREATE POLICY "Enable all access for super admins" 
ON public.themes FOR ALL 
TO authenticated 
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

-- 6. PASTIKAN AKUN ANDA ADALAH SUPER ADMIN
-- Ganti email di bawah ini dengan email yang Anda gunakan untuk login
UPDATE public.user_profiles 
SET role = 'super_admin' 
WHERE email = 'ondisia.id@gmail.com'; 

-- 7. Pastikan data tema memiliki slug
UPDATE public.themes SET slug = 'elegant-gold' WHERE name ILIKE '%Elegant%';
UPDATE public.themes SET is_active = true WHERE is_active IS NULL;

-- 8. STORAGE PERAIBAN (Untuk Thumbnail)
-- Pastikan bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('theme-thumbnails', 'theme-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'theme-thumbnails');

DROP POLICY IF EXISTS "Admin Manage" ON storage.objects;
CREATE POLICY "Admin Manage" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'theme-thumbnails');

-- TAMPILKAN STATUS
SELECT 'BERHASIL' as status, email, role FROM public.user_profiles WHERE id = auth.uid();
