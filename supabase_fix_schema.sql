-- ============================================
-- SCRIPT PERBAIKAN DATABASE (SAFE MODE)
-- Script ini aman dijalankan meskipun tabel sudah ada.
-- Akan menimpa policy lama dengan yang benar.
-- ============================================

-- 1. Pastikan Extension Aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Pastikan Tabel Ada & Tambah Kolom Kurang
-- User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE
);
-- Update kolom jika tabel sudah ada
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.user_profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.user_profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;


-- 1B. THEMES TABLE (Fitur Admin - Tema Dinamis)
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitations (Tambah kolom music_url & gallery_photos jika belum ada)
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  theme_id TEXT DEFAULT '1',
  -- ... (field lain dianggap ada jika tabel ada, tapi kita pastikan kolom baru)
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Kolom-kolom penting yang mungkin hilang
DO $$ 
BEGIN 
    -- Tambah music_url
    BEGIN
        ALTER TABLE public.invitations ADD COLUMN music_url TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Tambah gallery_photos
    BEGIN
        ALTER TABLE public.invitations ADD COLUMN gallery_photos TEXT[] DEFAULT '{}';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Tambah maps_url
    BEGIN
        ALTER TABLE public.invitations ADD COLUMN maps_url TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Pastikan tabel lain ada
CREATE TABLE IF NOT EXISTS public.love_story (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '💕',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rsvp_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  attendance TEXT NOT NULL,
  guest_count INTEGER DEFAULT 1,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RESET POLICIES (Hapus dulu biar tidak error "already exists")
-- User Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Themes
DROP POLICY IF EXISTS "Public can view active themes" ON public.themes;
DROP POLICY IF EXISTS "Super admins can manage themes" ON public.themes;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active themes" ON public.themes FOR SELECT USING (is_active = TRUE);
-- Policy admin akan dihandle di fix_recursion agar aman


-- Invitations
DROP POLICY IF EXISTS "Users can view own invitation" ON public.invitations;
DROP POLICY IF EXISTS "Users can insert own invitation" ON public.invitations;
DROP POLICY IF EXISTS "Users can update own invitation" ON public.invitations;
DROP POLICY IF EXISTS "Users can delete own invitation" ON public.invitations;
DROP POLICY IF EXISTS "Public can view published invitations" ON public.invitations;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own invitation" ON public.invitations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invitation" ON public.invitations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invitation" ON public.invitations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invitation" ON public.invitations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view published invitations" ON public.invitations FOR SELECT USING (is_published = TRUE);

-- Love Story
DROP POLICY IF EXISTS "Users can manage own love story" ON public.love_story;
DROP POLICY IF EXISTS "Public can view published love stories" ON public.love_story;
ALTER TABLE public.love_story ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own love story" ON public.love_story FOR ALL USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid()));
CREATE POLICY "Public can view published love stories" ON public.love_story FOR SELECT USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND is_published = TRUE));

-- Bank Accounts
DROP POLICY IF EXISTS "Users can manage own bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Public can view published bank accounts" ON public.bank_accounts;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bank accounts" ON public.bank_accounts FOR ALL USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid()));
CREATE POLICY "Public can view published bank accounts" ON public.bank_accounts FOR SELECT USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND is_published = TRUE));

-- Guests
DROP POLICY IF EXISTS "Users can manage own guests" ON public.guests;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own guests" ON public.guests FOR ALL USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid()));

-- RSVP
DROP POLICY IF EXISTS "Anyone can submit RSVP" ON public.rsvp_responses;
DROP POLICY IF EXISTS "Users can view own invitation RSVPs" ON public.rsvp_responses;
ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit RSVP" ON public.rsvp_responses FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can view own invitation RSVPs" ON public.rsvp_responses FOR SELECT USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid()));

-- 4. TRIGGERS (Recreate to ensure correct)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
