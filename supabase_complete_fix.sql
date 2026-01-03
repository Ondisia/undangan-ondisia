-- ================================================================
-- COMPREHENSIVE DATABASE FIX FOR INVITATION SAVE ISSUES
-- ================================================================
-- This script fixes ALL permission and function issues in one go.
-- Run this ONCE in your Supabase SQL Editor to fix save errors.
-- ================================================================

BEGIN;

-- ================================================================
-- PART 1: FIX ROW LEVEL SECURITY POLICIES
-- ================================================================

-- 1. INVITATIONS TABLE
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own invitation" ON invitations;
DROP POLICY IF EXISTS "Users can update their own invitation" ON invitations;
DROP POLICY IF EXISTS "Users can view own invitation" ON invitations;
DROP POLICY IF EXISTS "Public can view published invitations" ON invitations;

CREATE POLICY "Users can view own invitation" 
  ON invitations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invitation" 
  ON invitations FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invitation" 
  ON invitations FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view published invitations" 
  ON invitations FOR SELECT 
  USING (true);


-- 2. LOVE STORY TABLE
ALTER TABLE public.love_story ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own love story" ON love_story;
DROP POLICY IF EXISTS "Public can view published love stories" ON love_story;

CREATE POLICY "Users can manage own love story" 
  ON love_story FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM invitations 
      WHERE id = invitation_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view published love stories" 
  ON love_story FOR SELECT 
  USING (true);


-- 3. BANK ACCOUNTS TABLE
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Public can view published bank accounts" ON bank_accounts;

CREATE POLICY "Users can manage own bank accounts" 
  ON bank_accounts FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM invitations 
      WHERE id = invitation_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view published bank accounts" 
  ON bank_accounts FOR SELECT 
  USING (true);


-- 4. GUESTS TABLE
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own guests" ON guests;

CREATE POLICY "Users can manage own guests" 
  ON guests FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM invitations 
      WHERE id = invitation_id 
      AND user_id = auth.uid()
    )
  );


-- 5. RSVP RESPONSES TABLE
ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit RSVP" ON rsvp_responses;
DROP POLICY IF EXISTS "Users can view own invitation RSVPs" ON rsvp_responses;

CREATE POLICY "Anyone can submit RSVP" 
  ON rsvp_responses FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view own invitation RSVPs" 
  ON rsvp_responses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM invitations 
      WHERE id = invitation_id 
      AND user_id = auth.uid()
    )
  );


-- ================================================================
-- PART 2: FIX STORAGE POLICIES
-- ================================================================

-- Couple Photos Bucket
DROP POLICY IF EXISTS "Public Read Couple" ON storage.objects;
DROP POLICY IF EXISTS "User Upload Couple" ON storage.objects;
DROP POLICY IF EXISTS "User Update Couple" ON storage.objects;
DROP POLICY IF EXISTS "User Delete Couple" ON storage.objects;

CREATE POLICY "Public Read Couple" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'couple-photos');

CREATE POLICY "User Upload Couple" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'couple-photos');

CREATE POLICY "User Update Couple" 
  ON storage.objects FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'couple-photos');

CREATE POLICY "User Delete Couple" 
  ON storage.objects FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'couple-photos');


-- Gallery Photos Bucket
DROP POLICY IF EXISTS "Public Read Gallery" ON storage.objects;
DROP POLICY IF EXISTS "User Upload Gallery" ON storage.objects;
DROP POLICY IF EXISTS "User Update Gallery" ON storage.objects;
DROP POLICY IF EXISTS "User Delete Gallery" ON storage.objects;

CREATE POLICY "Public Read Gallery" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'gallery-photos');

CREATE POLICY "User Upload Gallery" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'gallery-photos');

CREATE POLICY "User Update Gallery" 
  ON storage.objects FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'gallery-photos');

CREATE POLICY "User Delete Gallery" 
  ON storage.objects FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'gallery-photos');


-- ================================================================
-- PART 3: CREATE ATOMIC SAVE FUNCTION (OPTIONAL BUT RECOMMENDED)
-- ================================================================

DROP FUNCTION IF EXISTS save_invitation_complete(UUID, JSONB);

CREATE OR REPLACE FUNCTION save_invitation_complete(
  p_user_id UUID,
  p_settings JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation_id UUID;
  v_item JSONB;
BEGIN
  -- 1. Upsert Invitation (Parent)
  INSERT INTO public.invitations (
    user_id, event_name, theme_id, opening_quote, closing_message, music_url,
    groom_name, groom_full_name, groom_title, groom_description, 
    groom_father_name, groom_mother_name, groom_photo_url,
    bride_name, bride_full_name, bride_title, bride_description, 
    bride_father_name, bride_mother_name, bride_photo_url,
    akad_date, akad_start_time, akad_end_time, akad_location,
    resepsi_date, resepsi_start_time, resepsi_end_time, resepsi_location,
    maps_url, gallery_photos, updated_at
  )
  VALUES (
    p_user_id,
    p_settings->>'eventName', 
    p_settings->>'selectedThemeId', 
    p_settings->>'openingQuote', 
    p_settings->>'closingMessage', 
    p_settings->>'musicUrl',
    p_settings->>'groomName', 
    p_settings->>'groomFullName', 
    p_settings->>'groomTitle', 
    p_settings->>'groomDescription', 
    p_settings->>'groomFatherName', 
    p_settings->>'groomMotherName', 
    p_settings->>'groomPhotoUrl',
    p_settings->>'brideName', 
    p_settings->>'brideFullName', 
    p_settings->>'brideTitle', 
    p_settings->>'brideDescription', 
    p_settings->>'brideFatherName', 
    p_settings->>'brideMotherName', 
    p_settings->>'bridePhotoUrl',
    (p_settings->>'akadDate')::DATE, 
    (p_settings->>'akadStartTime')::TIME, 
    (p_settings->>'akadEndTime')::TIME, 
    p_settings->>'akadLocation',
    (p_settings->>'resepsiDate')::DATE, 
    (p_settings->>'resepsiStartTime')::TIME, 
    (p_settings->>'resepsiEndTime')::TIME, 
    p_settings->>'resepsiLocation',
    p_settings->>'mapsUrl', 
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(p_settings->'galleryPhotos')), 
      '{}'
    ), 
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    event_name = EXCLUDED.event_name,
    theme_id = EXCLUDED.theme_id,
    opening_quote = EXCLUDED.opening_quote,
    closing_message = EXCLUDED.closing_message,
    music_url = EXCLUDED.music_url,
    groom_name = EXCLUDED.groom_name,
    groom_full_name = EXCLUDED.groom_full_name,
    groom_title = EXCLUDED.groom_title,
    groom_description = EXCLUDED.groom_description,
    groom_father_name = EXCLUDED.groom_father_name,
    groom_mother_name = EXCLUDED.groom_mother_name,
    groom_photo_url = EXCLUDED.groom_photo_url,
    bride_name = EXCLUDED.bride_name,
    bride_full_name = EXCLUDED.bride_full_name,
    bride_title = EXCLUDED.bride_title,
    bride_description = EXCLUDED.bride_description,
    bride_father_name = EXCLUDED.bride_father_name,
    bride_mother_name = EXCLUDED.bride_mother_name,
    bride_photo_url = EXCLUDED.bride_photo_url,
    akad_date = EXCLUDED.akad_date,
    akad_start_time = EXCLUDED.akad_start_time,
    akad_end_time = EXCLUDED.akad_end_time,
    akad_location = EXCLUDED.akad_location,
    resepsi_date = EXCLUDED.resepsi_date,
    resepsi_start_time = EXCLUDED.resepsi_start_time,
    resepsi_end_time = EXCLUDED.resepsi_end_time,
    resepsi_location = EXCLUDED.resepsi_location,
    maps_url = EXCLUDED.maps_url,
    gallery_photos = EXCLUDED.gallery_photos,
    updated_at = NOW()
  RETURNING id INTO v_invitation_id;

  -- 2. Handle Love Story (Delete old, insert new)
  DELETE FROM public.love_story WHERE invitation_id = v_invitation_id;
  
  IF jsonb_array_length(p_settings->'loveStory') > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_settings->'loveStory')
    LOOP
      INSERT INTO public.love_story (
        invitation_id, title, date, description, icon, order_index
      ) VALUES (
        v_invitation_id,
        v_item->>'title',
        v_item->>'date',
        v_item->>'description',
        v_item->>'icon',
        (v_item->>'order_index')::INTEGER
      );
    END LOOP;
  END IF;

  -- 3. Handle Bank Accounts (Delete old, insert new)
  DELETE FROM public.bank_accounts WHERE invitation_id = v_invitation_id;
  
  IF jsonb_array_length(p_settings->'bankAccounts') > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_settings->'bankAccounts')
    LOOP
      INSERT INTO public.bank_accounts (
        invitation_id, bank_name, account_number, account_holder, order_index
      ) VALUES (
        v_invitation_id,
        v_item->>'bankName',
        v_item->>'accountNumber',
        v_item->>'accountHolder',
        (v_item->>'order_index')::INTEGER
      );
    END LOOP;
  END IF;

  RETURN v_invitation_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION save_invitation_complete(UUID, JSONB) TO authenticated;

COMMIT;

-- ================================================================
-- SUCCESS! 
-- ================================================================
-- If you see "COMMIT" above, the fix was applied successfully.
-- Now refresh your application and try saving again.
-- ================================================================
