-- ============================================
-- SISTEM UNDANGAN DIGITAL - DATABASE SCHEMA
-- Copy & Paste script ini ke Supabase SQL Editor
-- Link: https://supabase.com/dashboard/project/_/sql/new
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'user')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- 2. INVITATIONS
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  theme_id TEXT DEFAULT '1',
  opening_quote TEXT,
  closing_message TEXT,
  groom_name TEXT NOT NULL,
  groom_full_name TEXT NOT NULL,
  groom_title TEXT,
  groom_description TEXT,
  groom_father_name TEXT,
  groom_mother_name TEXT,
  groom_photo_url TEXT,
  bride_name TEXT NOT NULL,
  bride_full_name TEXT NOT NULL,
  bride_title TEXT,
  bride_description TEXT,
  bride_father_name TEXT,
  bride_mother_name TEXT,
  bride_photo_url TEXT,
  akad_date DATE NOT NULL,
  akad_start_time TIME NOT NULL,
  akad_end_time TIME NOT NULL,
  akad_location TEXT NOT NULL,
  resepsi_date DATE NOT NULL,
  resepsi_start_time TIME NOT NULL,
  resepsi_end_time TIME NOT NULL,
  resepsi_location TEXT NOT NULL,
  maps_url TEXT,
  music_url TEXT,
  gallery_photos TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invitation" ON public.invitations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invitation" ON public.invitations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invitation" ON public.invitations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invitation" ON public.invitations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view published invitations" ON public.invitations FOR SELECT USING (is_published = TRUE);

-- 3. LOVE STORY
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

ALTER TABLE public.love_story ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own love story" ON public.love_story FOR ALL USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid()));
CREATE POLICY "Public can view published love stories" ON public.love_story FOR SELECT USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND is_published = TRUE));

-- 4. BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bank accounts" ON public.bank_accounts FOR ALL USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid()));
CREATE POLICY "Public can view published bank accounts" ON public.bank_accounts FOR SELECT USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND is_published = TRUE));

-- 5. GUESTS
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

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own guests" ON public.guests FOR ALL USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid()));

-- 6. RSVP RESPONSES
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

ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit RSVP" ON public.rsvp_responses FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can view own invitation RSVPs" ON public.rsvp_responses FOR SELECT USING (EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid()));

-- 7. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Selesai! Klik Run di Supabase.
