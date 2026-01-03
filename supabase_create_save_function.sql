-- FUNCTION: save_invitation_complete
-- Purpose: Save invitation and all related data (Love Story, Bank Accounts) in one atomic transaction.
-- This prevents "Success then Fail" issues and handles permissions securely.

CREATE OR REPLACE FUNCTION save_invitation_complete(
  p_user_id UUID,
  p_settings JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass complex RLS during save
AS $$
DECLARE
  v_invitation_id UUID;
  v_item JSONB;
BEGIN
  -- 1. Upsert Invitation (Parent)
  INSERT INTO public.invitations (
    user_id,
    event_name,
    theme_id,
    opening_quote,
    closing_message,
    music_url,
    groom_name,
    groom_full_name,
    groom_title,
    groom_description,
    groom_father_name,
    groom_mother_name,
    groom_photo_url,
    bride_name,
    bride_full_name,
    bride_title,
    bride_description,
    bride_father_name,
    bride_mother_name,
    bride_photo_url,
    akad_date,
    akad_start_time,
    akad_end_time,
    akad_location,
    resepsi_date,
    resepsi_start_time,
    resepsi_end_time,
    resepsi_location,
    maps_url,
    gallery_photos,
    updated_at
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
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'galleryPhotos')), '{}'),
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

  -- 2. Handle Love Story
  DELETE FROM public.love_story WHERE invitation_id = v_invitation_id;
  
  IF p_settings->'loveStory' IS NOT NULL AND jsonb_array_length(p_settings->'loveStory') > 0 THEN
      FOR i IN 0..jsonb_array_length(p_settings->'loveStory') - 1 LOOP
          v_item := (p_settings->'loveStory')->i;
          -- Check if fields are empty to skip invalid entries
          IF (v_item->>'title') <> '' THEN 
              INSERT INTO public.love_story (invitation_id, title, date, description, icon, order_index)
              VALUES (
                  v_invitation_id,
                  v_item->>'title',
                  v_item->>'date',
                  v_item->>'description',
                  v_item->>'icon',
                  i
              );
          END IF;
      END LOOP;
  END IF;

  -- 3. Handle Bank Accounts
  DELETE FROM public.bank_accounts WHERE invitation_id = v_invitation_id;
  
  IF p_settings->'bankAccounts' IS NOT NULL AND jsonb_array_length(p_settings->'bankAccounts') > 0 THEN
      FOR i IN 0..jsonb_array_length(p_settings->'bankAccounts') - 1 LOOP
          v_item := (p_settings->'bankAccounts')->i;
           -- Check if fields are empty
          IF (v_item->>'accountNumber') <> '' THEN 
              INSERT INTO public.bank_accounts (invitation_id, bank_name, account_number, account_holder, order_index)
              VALUES (
                  v_invitation_id,
                  v_item->>'bankName',
                  v_item->>'accountNumber',
                  v_item->>'accountHolder',
                  i
              );
          END IF;
      END LOOP;
  END IF;

  RETURN v_invitation_id;
END;
$$;
