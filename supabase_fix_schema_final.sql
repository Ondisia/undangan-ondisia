-- ================================================================
-- DATABASE SCHEMA SYNC & RELATIONSHIP FIX
-- ================================================================
-- Script ini memperbaiki hubungan antar tabel Themes dan Invitations
-- yang menyebabkan error "Database error querying schema"
-- ================================================================

BEGIN;

-- 1. PASTIKAN TABEL THEMES MEMILIKI DATA AWAL (Jika Kosong)
INSERT INTO public.themes (name, description, slug, category, is_active)
VALUES 
('Elegant Gold', 'Tema mewah.', 'elegant-gold', 'luxury', true)
ON CONFLICT DO NOTHING;

-- 2. KONVERSI KOLOM theme_id DI TABEL invitations MENJADI UUID
-- Langkah ini perlu hati-hati jika sudah ada data. 
-- Kita ambil ID tema pertama yang ada sebagai default.

DO $$ 
DECLARE 
    v_first_theme_id UUID;
BEGIN
    -- Ambil satu UUID tema yang valid
    SELECT id INTO v_first_theme_id FROM public.themes LIMIT 1;
    
    -- Jika kolom masih text, kita ubah. Jika sudah UUID, tidak apa-apa.
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='invitations' AND column_name='theme_id' AND data_type='text') THEN
        
        -- Update '1' atau data lama menjadi UUID valid dulu agar konversi tidak error
        UPDATE public.invitations SET theme_id = v_first_theme_id::text WHERE theme_id = '1' OR theme_id IS NULL;
        
        -- Ubah tipe data kolom
        ALTER TABLE public.invitations 
        ALTER COLUMN theme_id TYPE UUID USING theme_id::UUID;
        
        -- Berikan default yang baru (valid UUID)
        ALTER TABLE public.invitations 
        ALTER COLUMN theme_id SET DEFAULT v_first_theme_id;
    END IF;
END $$;

-- 3. TAMBAHKAN FOREIGN KEY RELATIONSHIP (Kritikal untuk Join Metadata)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='invitations_theme_id_fkey') THEN
        ALTER TABLE public.invitations
        ADD CONSTRAINT invitations_theme_id_fkey
        FOREIGN KEY (theme_id) REFERENCES public.themes(id)
        ON DELETE SET DEFAULT;
    END IF;
END $$;

-- 4. PERBAIKI TABEL USER_PROFILES
-- Tambahkan kolom assigned_theme_id jika belum ada (biasanya UUID)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='assigned_theme_id') THEN
        ALTER TABLE public.user_profiles ADD COLUMN assigned_theme_id UUID REFERENCES public.themes(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. REFRESH CACHE POSTGREST (Hanya di Supabase Cloud, dijalankan internal)
-- Secara SQL kita hanya perlu memastikan schema metadata konsisten.

COMMIT;

-- VERIFIKASI
SELECT 'Tabel invitations kini terhubung dengan themes' as status;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invitations' AND column_name = 'theme_id';
