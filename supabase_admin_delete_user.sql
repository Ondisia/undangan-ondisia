-- ================================================================
-- ADMIN USER DELETION FUNCTION
-- ================================================================
-- Memungkinkan Admin (super_admin) untuk menghapus user 
-- beserta seluruh datanya (invitation, rsvp, gallery, dll) 
-- dan menghapus akun mereka dari auth.users secara permanen.
-- ================================================================

CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Menjalankan dengan hak akses tinggi untuk menghapus dari auth.users
AS $$
BEGIN
    -- 1. Cek apakah orang yang memanggil fungsi adalah super_admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    ) THEN
        RAISE EXCEPTION 'Akses Ditolak: Hanya super_admin yang bisa menghapus user.';
    END IF;

    -- 2. Cegah penghapusan diri sendiri
    IF auth.uid() = target_user_id THEN
        RAISE EXCEPTION 'Gagal: Anda tidak bisa menghapus akun Anda sendiri.';
    END IF;

    -- 3. Hapus data publik (opsional karena ON DELETE CASCADE sudah diset)
    -- Namun kita pastikan pembersihan total.
    DELETE FROM public.user_profiles WHERE id = target_user_id;

    -- 4. Hapus user dari sistem autentikasi Supabase
    DELETE FROM auth.users WHERE id = target_user_id;

END;
$$;

-- Berikan izin eksekusi ke user terautentikasi (dicek di dalam fungsi)
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID) TO authenticated;
