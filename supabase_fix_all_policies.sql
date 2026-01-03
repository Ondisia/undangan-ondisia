-- SCRIPT PERBAIKAN PERMISSION LENGKAP v2
-- Menangani: Storage, Undangan, Love Story, Bank Account, Tamu, RSVP.
-- Jalankan script ini di SQL Editor untuk memperbaiki gagal simpan.

-- ==========================
-- 1. PERBAIKAN STORAGE (FOTO)
-- ==========================
DROP POLICY IF EXISTS "Public Read Couple" ON storage.objects;
DROP POLICY IF EXISTS "User Upload Couple" ON storage.objects;
DROP POLICY IF EXISTS "User Update Couple" ON storage.objects;
DROP POLICY IF EXISTS "User Delete Couple" ON storage.objects;

DROP POLICY IF EXISTS "Public Read Gallery" ON storage.objects;
DROP POLICY IF EXISTS "User Upload Gallery" ON storage.objects;
DROP POLICY IF EXISTS "User Update Gallery" ON storage.objects;
DROP POLICY IF EXISTS "User Delete Gallery" ON storage.objects;

-- Policy Couple Photos
CREATE POLICY "Public Read Couple" ON storage.objects FOR SELECT USING (bucket_id = 'couple-photos');
CREATE POLICY "User Upload Couple" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'couple-photos');
CREATE POLICY "User Update Couple" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'couple-photos');
CREATE POLICY "User Delete Couple" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'couple-photos');

-- Policy Gallery Photos
CREATE POLICY "Public Read Gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-photos');
CREATE POLICY "User Upload Gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery-photos');
CREATE POLICY "User Update Gallery" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery-photos');
CREATE POLICY "User Delete Gallery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery-photos');


-- ==========================
-- 2. PERBAIKAN DATABASE (DATA)
-- ==========================

-- A. INVITATIONS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert their own invitation" ON invitations;
DROP POLICY IF EXISTS "Users can update their own invitation" ON invitations;
DROP POLICY IF EXISTS "Users can select their own invitation" ON invitations; -- Drop old name variant
DROP POLICY IF EXISTS "Users can view own invitation" ON invitations;
DROP POLICY IF EXISTS "Public can view invitations" ON invitations;
DROP POLICY IF EXISTS "Public can view published invitations" ON invitations;

CREATE POLICY "Users can view own invitation" ON invitations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own invitation" ON invitations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invitation" ON invitations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public can view published invitations" ON invitations FOR SELECT USING (true); -- Allow public seeing any invitation (filtered by code usually, or is_published logic)


-- B. LOVE STORY (Bagian ini yang mungkin bikin error simpan)
ALTER TABLE public.love_story ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own love story" ON love_story;
DROP POLICY IF EXISTS "Public can view published love stories" ON love_story;

CREATE POLICY "Users can manage own love story" ON love_story FOR ALL USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
CREATE POLICY "Public can view published love stories" ON love_story FOR SELECT USING (true);


-- C. BANK ACCOUNTS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Public can view published bank accounts" ON bank_accounts;

CREATE POLICY "Users can manage own bank accounts" ON bank_accounts FOR ALL USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
CREATE POLICY "Public can view published bank accounts" ON bank_accounts FOR SELECT USING (true);

-- D. GUESTS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own guests" ON guests;

CREATE POLICY "Users can manage own guests" ON guests FOR ALL USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);

-- E. RSVP
ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit RSVP" ON rsvp_responses;
DROP POLICY IF EXISTS "Users can view own invitation RSVPs" ON rsvp_responses;

CREATE POLICY "Anyone can submit RSVP" ON rsvp_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own invitation RSVPs" ON rsvp_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
