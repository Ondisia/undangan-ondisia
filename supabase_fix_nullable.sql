    -- ================================================================
    -- FIX FOR "null value violates not-null constraint" ERROR
    -- ================================================================
    -- This script makes optional fields truly optional in the database
    -- Run this in Supabase SQL Editor
    -- ================================================================

    BEGIN;

    -- Make all couple information fields NULLABLE (optional)
    -- This allows users to save partial data and complete it later

    ALTER TABLE public.invitations 
    ALTER COLUMN groom_name DROP NOT NULL,
    ALTER COLUMN groom_full_name DROP NOT NULL,
    ALTER COLUMN groom_description DROP NOT NULL,
    ALTER COLUMN groom_father_name DROP NOT NULL,
    ALTER COLUMN groom_mother_name DROP NOT NULL,
    
    ALTER COLUMN bride_name DROP NOT NULL,
    ALTER COLUMN bride_full_name DROP NOT NULL,
    ALTER COLUMN bride_description DROP NOT NULL,
    ALTER COLUMN bride_father_name DROP NOT NULL,
    ALTER COLUMN bride_mother_name DROP NOT NULL,
    
    ALTER COLUMN akad_date DROP NOT NULL,
    ALTER COLUMN akad_start_time DROP NOT NULL,
    ALTER COLUMN akad_end_time DROP NOT NULL,
    ALTER COLUMN akad_location DROP NOT NULL,
    
    ALTER COLUMN resepsi_date DROP NOT NULL,
    ALTER COLUMN resepsi_start_time DROP NOT NULL,
    ALTER COLUMN resepsi_end_time DROP NOT NULL,
    ALTER COLUMN resepsi_location DROP NOT NULL;

    -- Set default empty strings for text fields to avoid null issues
    UPDATE public.invitations 
    SET 
    groom_name = COALESCE(groom_name, ''),
    groom_full_name = COALESCE(groom_full_name, ''),
    groom_description = COALESCE(groom_description, ''),
    groom_father_name = COALESCE(groom_father_name, ''),
    groom_mother_name = COALESCE(groom_mother_name, ''),
    bride_name = COALESCE(bride_name, ''),
    bride_full_name = COALESCE(bride_full_name, ''),
    bride_description = COALESCE(bride_description, ''),
    bride_father_name = COALESCE(bride_father_name, ''),
    bride_mother_name = COALESCE(bride_mother_name, ''),
    akad_location = COALESCE(akad_location, ''),
    resepsi_location = COALESCE(resepsi_location, '')
    WHERE 
    groom_name IS NULL 
    OR groom_full_name IS NULL 
    OR bride_name IS NULL 
    OR bride_full_name IS NULL;

    COMMIT;

    -- ================================================================
    -- SUCCESS!
    -- ================================================================
    -- Now you can save settings even if couple info is incomplete.
    -- You can fill it in later tab by tab.
    -- ================================================================
