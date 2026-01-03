-- ================================================================
-- ADMIN USER CREATION FUNCTION
-- ================================================================
-- This function allows an Admin (super_admin) to create a new user 
-- account and assign their initial theme in one transaction.
-- ================================================================

CREATE OR REPLACE FUNCTION admin_create_user(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_theme_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to access auth.users
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- 1. Check if caller is super_admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Only super_admin can create users.';
    END IF;

    -- 2. Create the user in auth.users
    -- Note: We use pgcrypto (crypt) for password hashing. 
    -- Supabase uses bcrypt for passwords.
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        last_sign_in_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_email_change_at,
        is_sso_user,
        deleted_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        p_email,
        crypt(p_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('full_name', p_full_name),
        false,
        now(),
        now(),
        now(),
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        false,
        NULL
    )
    RETURNING id INTO v_user_id;

    -- 3. The trigger 'on_auth_user_created' will automatically create the user_profiles entry.
    -- However, we need to UPDATE it with the full_name and assigned_theme_id.
    -- We wait a tiny bit or just update it directly after.
    
    UPDATE public.user_profiles 
    SET 
        full_name = p_full_name,
        assigned_theme_id = p_theme_id
    WHERE id = v_user_id;

    RETURN v_user_id;
END;
$$;

-- Add assigned_theme_id column to user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='assigned_theme_id') THEN
        ALTER TABLE public.user_profiles ADD COLUMN assigned_theme_id UUID REFERENCES public.themes(id);
    END IF;
END $$;
