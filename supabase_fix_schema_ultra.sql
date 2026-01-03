-- ================================================================
-- DATABASE SCHEMA SYNC & RELATIONSHIP FIX (ULTRA ROBUST)
-- ================================================================
-- Script ini menangani error "invalid input syntax for type uuid"
-- dengan membersihkan SEMUA data yang bukan format UUID.
-- ================================================================

BEGIN;

-- 1. Pastikan ada data tema dasar dan ambil ID-nya
INSERT INTO public.themes (name, description, slug, category, is_active)
VALUES ('Elegant Gold', 'Tema mewah.', 'elegant-gold', 'luxury', true)
ON CONFLICT DO NOTHING;

DO $$ 
DECLARE 
    v_first_theme_id UUID;
    v_current_type TEXT;
BEGIN
    SELECT id INTO v_first_theme_id FROM public.themes LIMIT 1;
    
    -- Cek tipe data invitations.theme_id
    SELECT data_type INTO v_current_type 
    FROM information_schema.columns 
    WHERE table_name='invitations' AND column_name='theme_id';

    IF v_current_type = 'text' THEN
        -- A. Hapus default value agar tidak menghalangi konversi
        ALTER TABLE public.invitations ALTER COLUMN theme_id DROP DEFAULT;

        -- B. Bersihkan SEMUA data yang TIDAK sesuai format UUID
        -- Kita paksa semua yang bukan UUID menjadi ID tema pertama yang kita punya
        UPDATE public.invitations 
        SET theme_id = v_first_theme_id::text 
        WHERE theme_id IS NULL 
           OR theme_id = '' 
           OR theme_id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
        
        -- C. Ubah tipe data kolom
        ALTER TABLE public.invitations 
        ALTER COLUMN theme_id TYPE UUID USING theme_id::UUID;
        
        -- D. Set Default Baru
        ALTER TABLE public.invitations 
        ALTER COLUMN theme_id SET DEFAULT v_first_theme_id;
    END IF;

    -- Cek tipe data user_profiles.assigned_theme_id
    SELECT data_type INTO v_current_type 
    FROM information_schema.columns 
    WHERE table_name='user_profiles' AND column_name='assigned_theme_id';

    IF v_current_type = 'text' THEN
        ALTER TABLE public.user_profiles ALTER COLUMN assigned_theme_id DROP DEFAULT;
        
        -- Bersihkan data yang bukan UUID
        UPDATE public.user_profiles 
        SET assigned_theme_id = NULL 
        WHERE assigned_theme_id IS NULL 
           OR assigned_theme_id = '' 
           OR assigned_theme_id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

        ALTER TABLE public.user_profiles 
        ALTER COLUMN assigned_theme_id TYPE UUID USING assigned_theme_id::UUID;
    END IF;
END $$;

-- 2. Tambahkan Foreign Keys jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='invitations_theme_id_fkey') THEN
        ALTER TABLE public.invitations ADD CONSTRAINT invitations_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id) ON DELETE SET DEFAULT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='user_profiles_assigned_theme_id_fkey') THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_assigned_theme_id_fkey FOREIGN KEY (assigned_theme_id) REFERENCES public.themes(id) ON DELETE SET NULL;
    END IF;
END $$;

COMMIT;

-- VERIFIKASI AKHIR
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE column_name IN ('theme_id', 'assigned_theme_id');
