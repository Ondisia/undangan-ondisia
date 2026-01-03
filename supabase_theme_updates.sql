-- ================================================================
-- THEME MANAGEMENT UPDATES
-- ================================================================

-- 1. Add slug/component_name to themes table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='themes' AND column_name='slug') THEN
        ALTER TABLE public.themes ADD COLUMN slug TEXT;
    END IF;
END $$;

-- 2. Create Storage Bucket for Theme Thumbnails
-- Note: This requires the storage extension to be enabled (usually enabled by default)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('theme-thumbnails', 'theme-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies for 'theme-thumbnails'
-- Allow public to read
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'theme-thumbnails');

-- Allow authenticated (admin) to upload/update/delete
DROP POLICY IF EXISTS "Admin Manage" ON storage.objects;
CREATE POLICY "Admin Manage" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'theme-thumbnails');

-- 4. Add some initial themes if table is empty
INSERT INTO public.themes (name, description, slug, category, is_active)
VALUES 
('Elegant Gold', 'Tema mewah dengan sentuhan warna emas dan font klasik.', 'elegant-gold', 'luxury', true),
('Rustic Floral', 'Sentuhan alam dengan bunga-bunga lembut dan tekstur kayu.', 'rustic-floral', 'rustic', true),
('Modern Minimalist', 'Bersih, kontemporer, dan fokus pada tipografi yang kuat.', 'modern-minimalist', 'minimalist', true)
ON CONFLICT DO NOTHING;
