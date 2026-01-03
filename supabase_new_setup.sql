-- ============================================
-- UNDANGAN DIGITAL - SETUP LENGKAP UNTUK SUPABASE BARU
-- ============================================
-- Script ini untuk membuat database schema lengkap di Supabase baru
-- Jalankan di SQL Editor: https://supabase.com/dashboard/project/_/sql/new
-- Status: PRODUCTION READY
-- ============================================

BEGIN;

-- ============================================
-- 1. SETUP EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. CREATE USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'user')),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CREATE INVITATIONS TABLE (Main Table)
-- ============================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  theme_id TEXT DEFAULT '1',
  opening_quote TEXT,
  closing_message TEXT,
  
  -- Groom Information
  groom_name TEXT NOT NULL,
  groom_full_name TEXT NOT NULL,
  groom_title TEXT,
  groom_description TEXT,
  groom_father_name TEXT,
  groom_mother_name TEXT,
  groom_photo_url TEXT,
  
  -- Bride Information
  bride_name TEXT NOT NULL,
  bride_full_name TEXT NOT NULL,
  bride_title TEXT,
  bride_description TEXT,
  bride_father_name TEXT,
  bride_mother_name TEXT,
  bride_photo_url TEXT,
  
  -- Akad Nikah Details
  akad_date DATE NOT NULL,
  akad_start_time TIME NOT NULL,
  akad_end_time TIME NOT NULL,
  akad_location TEXT NOT NULL,
  
  -- Resepsi Details
  resepsi_date DATE NOT NULL,
  resepsi_start_time TIME NOT NULL,
  resepsi_end_time TIME NOT NULL,
  resepsi_location TEXT NOT NULL,
  
  -- Additional Info
  maps_url TEXT,
  music_url TEXT,
  gallery_photos TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: One invitation per user
  UNIQUE(user_id)
);

-- ============================================
-- 4. CREATE LOVE STORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.love_story (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '💕',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. CREATE BANK ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. CREATE GUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'confirmed', 'declined')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. CREATE RSVP RESPONSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.rsvp_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK (attendance IN ('accept', 'decline', 'maybe')),
  guest_count INTEGER DEFAULT 1,
  message TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. CREATE GALLERY TABLE (for image tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- User Profiles RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Invitations RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own invitation" ON public.invitations;
DROP POLICY IF EXISTS "Users can insert own invitation" ON public.invitations;
DROP POLICY IF EXISTS "Users can update own invitation" ON public.invitations;
DROP POLICY IF EXISTS "Users can delete own invitation" ON public.invitations;
DROP POLICY IF EXISTS "Public can view published invitations" ON public.invitations;

CREATE POLICY "Users can view own invitation" 
  ON public.invitations FOR SELECT 
  USING (auth.uid() = user_id OR is_published = TRUE);

CREATE POLICY "Users can insert own invitation" 
  ON public.invitations FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invitation" 
  ON public.invitations FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invitation" 
  ON public.invitations FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view published invitations" 
  ON public.invitations FOR SELECT 
  USING (is_published = TRUE);

-- Love Story RLS
ALTER TABLE public.love_story ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own love story" ON public.love_story;
DROP POLICY IF EXISTS "Public can view published love stories" ON public.love_story;

CREATE POLICY "Users can manage own love story" 
  ON public.love_story FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE id = invitation_id AND user_id = auth.uid()
  ));

CREATE POLICY "Public can view published love stories" 
  ON public.love_story FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE id = invitation_id AND is_published = TRUE
  ));

-- Bank Accounts RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Public can view published bank accounts" ON public.bank_accounts;

CREATE POLICY "Users can manage own bank accounts" 
  ON public.bank_accounts FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE id = invitation_id AND user_id = auth.uid()
  ));

CREATE POLICY "Public can view published bank accounts" 
  ON public.bank_accounts FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE id = invitation_id AND is_published = TRUE
  ));

-- Guests RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own guests" ON public.guests;
DROP POLICY IF EXISTS "Public can view guest list" ON public.guests;

CREATE POLICY "Users can manage own guests" 
  ON public.guests FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE id = invitation_id AND user_id = auth.uid()
  ));

CREATE POLICY "Public can view guest list" 
  ON public.guests FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE id = invitation_id AND is_published = TRUE
  ));

-- RSVP Responses RLS
ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit RSVP" ON public.rsvp_responses;
DROP POLICY IF EXISTS "Users can view own invitation RSVPs" ON public.rsvp_responses;

CREATE POLICY "Anyone can submit RSVP" 
  ON public.rsvp_responses FOR INSERT 
  WITH CHECK (TRUE);

CREATE POLICY "Users can view own invitation RSVPs" 
  ON public.rsvp_responses FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE id = invitation_id AND user_id = auth.uid()
  ));

-- Gallery RLS
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public can view published gallery" ON public.gallery;

CREATE POLICY "Users can manage own gallery" 
  ON public.gallery FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE id = invitation_id AND user_id = auth.uid()
  ));

CREATE POLICY "Public can view published gallery" 
  ON public.gallery FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE id = invitation_id AND is_published = TRUE
  ));

-- ============================================
-- 10. CREATE TRIGGERS FOR USER CREATION
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    full_name, 
    role
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 11. CREATE TRIGGERS FOR TIMESTAMPS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for invitations
DROP TRIGGER IF EXISTS update_invitations_updated_at ON public.invitations;
CREATE TRIGGER update_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for love_story
DROP TRIGGER IF EXISTS update_love_story_updated_at ON public.love_story;
CREATE TRIGGER update_love_story_updated_at
BEFORE UPDATE ON public.love_story
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for bank_accounts
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON public.bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at
BEFORE UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for guests
DROP TRIGGER IF EXISTS update_guests_updated_at ON public.guests;
CREATE TRIGGER update_guests_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 12. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Invitations indexes
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON public.invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON public.invitations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_is_published ON public.invitations(is_published);

-- Love Story indexes
CREATE INDEX IF NOT EXISTS idx_love_story_invitation_id ON public.love_story(invitation_id);
CREATE INDEX IF NOT EXISTS idx_love_story_order ON public.love_story(invitation_id, order_index);

-- Bank Accounts indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_invitation_id ON public.bank_accounts(invitation_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_order ON public.bank_accounts(invitation_id, order_index);

-- Guests indexes
CREATE INDEX IF NOT EXISTS idx_guests_invitation_id ON public.guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guests_status ON public.guests(status);

-- RSVP Responses indexes
CREATE INDEX IF NOT EXISTS idx_rsvp_responses_invitation_id ON public.rsvp_responses(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_responses_created_at ON public.rsvp_responses(created_at DESC);

-- Gallery indexes
CREATE INDEX IF NOT EXISTS idx_gallery_invitation_id ON public.gallery(invitation_id);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON public.gallery(invitation_id, order_index);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at DESC);

-- ============================================
-- 13. CREATE USEFUL FUNCTIONS
-- ============================================

-- Function: Get invitation with all related data
CREATE OR REPLACE FUNCTION public.get_invitation_complete(p_invitation_id UUID)
RETURNS TABLE (
  invitation_id UUID,
  user_id UUID,
  event_name TEXT,
  is_published BOOLEAN,
  love_story_count BIGINT,
  bank_accounts_count BIGINT,
  guests_count BIGINT,
  rsvp_count BIGINT,
  gallery_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.user_id,
    i.event_name,
    i.is_published,
    COALESCE(COUNT(DISTINCT ls.id), 0),
    COALESCE(COUNT(DISTINCT ba.id), 0),
    COALESCE(COUNT(DISTINCT g.id), 0),
    COALESCE(COUNT(DISTINCT rr.id), 0),
    COALESCE(COUNT(DISTINCT gal.id), 0)
  FROM public.invitations i
  LEFT JOIN public.love_story ls ON i.id = ls.invitation_id
  LEFT JOIN public.bank_accounts ba ON i.id = ba.invitation_id
  LEFT JOIN public.guests g ON i.id = g.invitation_id
  LEFT JOIN public.rsvp_responses rr ON i.id = rr.invitation_id
  LEFT JOIN public.gallery gal ON i.id = gal.invitation_id
  WHERE i.id = p_invitation_id
  GROUP BY i.id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get RSVP summary
CREATE OR REPLACE FUNCTION public.get_rsvp_summary(p_invitation_id UUID)
RETURNS TABLE (
  total_responses BIGINT,
  accepted BIGINT,
  declined BIGINT,
  maybe BIGINT,
  total_guests BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COALESCE(SUM(CASE WHEN attendance = 'accept' THEN 1 ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(CASE WHEN attendance = 'decline' THEN 1 ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(CASE WHEN attendance = 'maybe' THEN 1 ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(guest_count), 0)::BIGINT
  FROM public.rsvp_responses
  WHERE invitation_id = p_invitation_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 14. GRANT PERMISSIONS
-- ============================================

-- Grant basic permissions to authenticated users
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.invitations TO authenticated;
GRANT ALL ON public.love_story TO authenticated;
GRANT ALL ON public.bank_accounts TO authenticated;
GRANT ALL ON public.guests TO authenticated;
GRANT ALL ON public.rsvp_responses TO authenticated;
GRANT ALL ON public.gallery TO authenticated;

-- Grant SELECT to anon (public) users for published content
GRANT SELECT ON public.invitations TO anon;
GRANT SELECT ON public.love_story TO anon;
GRANT SELECT ON public.bank_accounts TO anon;
GRANT SELECT ON public.guests TO anon;
GRANT SELECT ON public.rsvp_responses TO anon;
GRANT SELECT ON public.gallery TO anon;
GRANT SELECT ON public.user_profiles TO anon;

-- Grant function execution
GRANT EXECUTE ON FUNCTION public.get_invitation_complete(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_rsvp_summary(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;

COMMIT;

-- ============================================
-- VERIFIKASI SETUP BERHASIL
-- ============================================
-- Jalankan query berikut untuk memverifikasi:
-- SELECT table_name FROM information_schema.tables WHERE table_schema='public';
-- SELECT * FROM pg_stat_user_tables WHERE schemaname='public';
-- ============================================
