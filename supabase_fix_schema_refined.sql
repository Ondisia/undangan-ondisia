-- ================================================================
-- DATABASE SCHEMA SYNC & RELATIONSHIP FIX (REFINED)
-- ================================================================
-- Script ini memperbaiki error tipe data theme_id dari TEXT ke UUID
-- dengan cara menghapus default value yang lama terlebih dahulu.
-- ================================================================

BEGIN;

-- 1. Ambil ID tema pertama sebagai cadangan (Pastikan ada tema)
DO $$ 
DECLARE 
    v_first_theme_id UUID;
BEGIN
    -- Pastikan ada data tema dasar dulu
    INSERT INTO public.themes (name, description, slug, category, is_active)
    VALUES ('Elegant Gold', 'Tema mewah.', 'elegant-gold', 'luxury', true)
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_first_theme_id FROM public.themes LIMIT 1;
    
    -- Konversi kolom theme_id di tabel invitations menjadi UUID jika masih text
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='invitations' AND column_name='theme_id' AND data_type='text') THEN
        
        -- A. Hapus default value lama (biasanya ini yang menyebabkan error cast)
        ALTER TABLE public.invitations ALTER COLUMN theme_id DROP DEFAULT;

        -- B. Bersihkan data lama agar bisa dikonversi ke UUID
        -- Jika isinya '1' atau null, ganti ke UUID tema yang valid
        UPDATE public.invitations 
        SET theme_id = v_first_theme_id::text 
        WHERE theme_id = '1' OR theme_id IS NULL OR theme_id = '';
        
        -- C. Ubah tipe data kolom secara permanen menggunakan USING clause
        ALTER TABLE public.invitations 
        ALTER COLUMN theme_id TYPE UUID USING theme_id::UUID;
        
        -- D. Berikan default value yang baru (valid UUID)
        ALTER TABLE public.invitations 
        ALTER COLUMN theme_id SET DEFAULT v_first_theme_id;
    END IF;
END $$;

-- 2. Buat Hubungan (Foreign Key) agar Query Join stabil
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

-- 3. Pastikan kolom di user_profiles juga konsisten (TEXT to UUID)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='user_profiles' AND column_name='assigned_theme_id' AND data_type='text') THEN
        
        -- Hapus default jika ada
        ALTER TABLE public.user_profiles ALTER COLUMN assigned_theme_id DROP DEFAULT;
        
        -- Update data non-uuid menjadi null
        UPDATE public.user_profiles 
        SET assigned_theme_id = NULL 
        WHERE assigned_theme_id = '1' OR assigned_theme_id = '';

        ALTER TABLE public.user_profiles 
        ALTER COLUMN assigned_theme_id TYPE UUID USING assigned_theme_id::UUID;
        
        -- Tambahkan FK ke themes
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name='user_profiles_assigned_theme_id_fkey') THEN
            ALTER TABLE public.user_profiles
            ADD CONSTRAINT user_profiles_assigned_theme_id_fkey
            FOREIGN KEY (assigned_theme_id) REFERENCES public.themes(id)
            ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

COMMIT;

-- VERIFIKASI AKHIR
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE column_name IN ('theme_id', 'assigned_theme_id');
