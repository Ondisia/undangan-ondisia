import { supabase } from '@/lib/supabaseClient';

export interface Theme {
    id: string;
    name: string;
    description: string;
    thumbnail_url: string;
    category: string;
    slug: string; // The identifier for the layout component
    is_active: boolean;
    created_at?: string;
}

// --- Storage Service ---

export const uploadThemeThumbnail = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from('theme-thumbnails')
        .upload(filePath, file);

    if (error) throw error;

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('theme-thumbnails')
        .getPublicUrl(filePath);

    return publicUrl;
};

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    phone: string;
    is_active: boolean;
    last_login: string;
    created_at: string;
    assigned_theme_id?: string | null;
}

// --- Themes Service ---

export const getThemes = async () => {
    const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Theme[];
};

export const createTheme = async (theme: Omit<Theme, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('themes')
        .insert(theme)
        .select()
        .single();

    if (error) throw error;
    return data as Theme;
};

export const updateTheme = async (id: string, updates: Partial<Theme>) => {
    const { data, error } = await supabase
        .from('themes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Theme;
};

export const deleteTheme = async (id: string) => {
    const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// --- Users Service (Admin Only) ---

export const getAllUsers = async () => {
    // Requires 'super_admin' role, checked by RLS (or handled by API)
    // Note: We access 'user_profiles' which RLS allows super_admin to see ALL
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserProfile[];
};

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data as UserProfile;
};

export const assignThemeToUser = async (userId: string, themeId: string | null) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .update({ assigned_theme_id: themeId })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data as UserProfile;
};

export const adminCreateUser = async (userData: { email: string; password: string; fullName: string; themeId: string }) => {
    const { data, error } = await supabase.rpc('admin_create_user', {
        p_email: userData.email,
        p_password: userData.password,
        p_full_name: userData.fullName,
        p_theme_id: userData.themeId
    });

    if (error) throw error;
    return data;
};

export const deleteUser = async (userId: string) => {
    const { data, error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId
    });

    if (error) throw error;
    return data;
};

export const getDashboardStats = async () => {
    // Parallel fetch for counts
    const [users, themes, activeThemes] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('themes').select('*', { count: 'exact', head: true }),
        supabase.from('themes').select('*', { count: 'exact', head: true }).eq('is_active', true)
    ]);

    return {
        totalUsers: users.count || 0,
        totalThemes: themes.count || 0,
        activeThemes: activeThemes.count || 0
    };
};

export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data as UserProfile;
};
