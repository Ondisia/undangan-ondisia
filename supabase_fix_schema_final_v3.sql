-- ================================================================
-- DATABASE SCHEMA SYNC & RELATIONSHIP FIX (FINAL STABLE V3)
-- ================================================================
-- Memperbaiki error "cannot use column reference in DEFAULT"
-- Dan memastikan pola deteksi UUID benar.
-- ================================================================

BEGIN;

-- 1. Pastikan ada data tema dasar
INSERT INTO public.themes (name, description, slug, category, is_active)
VALUES ('Elegant Gold', 'Tema mewah.', 'elegant-gold', 'luxury', true)
ON CONFLICT DO NOTHING;

DO $$ 
DECLARE 
    v_first_theme_id UUID;
    v_current_type TEXT;
BEGIN
    -- Ambil ID tema pertama
    SELECT id INTO v_first_theme_id FROM public.themes LIMIT 1;
    
    -- --- TABEL INVITATIONS ---
    SELECT data_type INTO v_current_type 
    FROM information_schema.columns 
    WHERE table_name='invitations' AND column_name='theme_id';

    IF v_current_type = 'text' THEN
        -- Hapus default lama
        ALTER TABLE public.invitations ALTER COLUMN theme_id DROP DEFAULT;

        -- Bersihkan data yang bukan UUID (Pola: 8-4-4-4-12)
        UPDATE public.invitations 
        SET theme_id = v_first_theme_id::text 
        WHERE theme_id IS NULL 
           OR theme_id = '' 
           OR theme_id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
        
        -- Ubah tipe data
        ALTER TABLE public.invitations 
        ALTER COLUMN theme_id TYPE UUID USING theme_id::UUID;
        
        -- Set Default Baru dengan EXECUTE (agar bisa pakai variabel)
        EXECUTE format('ALTER TABLE public.invitations ALTER COLUMN theme_id SET DEFAULT %L', v_first_theme_id);
    END IF;

    -- --- TABEL USER_PROFILES ---
    SELECT data_type INTO v_current_type 
    FROM information_schema.columns 
    WHERE table_name='user_profiles' AND column_name='assigned_theme_id';

    IF v_current_type = 'text' THEN
        ALTER TABLE public.user_profiles ALTER COLUMN assigned_theme_id DROP DEFAULT;
        
        UPDATE public.user_profiles 
        SET assigned_theme_id = NULL 
        WHERE assigned_theme_id IS NULL 
           OR assigned_theme_id = '' 
           OR assigned_theme_id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

        ALTER TABLE public.user_profiles 
        ALTER COLUMN assigned_theme_id TYPE UUID USING assigned_theme_id::UUID;
    END IF;
END $$;

-- 2. Tambahkan Hubungan (Foreign Keys)
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

-- VERIFIKASI SELESAI
SELECT 'Struktur Database Berhasil Diperbarui' as info;
