import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut, getUserProfile } from '@/lib/supabaseClient';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: 'super_admin' | 'user';
    phone: string | null;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string) => Promise<any>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadUserProfile = async (userId: string) => {
        try {
            const profileData = await getUserProfile(userId);
            setProfile(profileData as UserProfile);
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (email: string, password: string) => {
        const { user: signedInUser } = await supabaseSignIn(email, password);
        if (signedInUser) {
            await loadUserProfile(signedInUser.id);
        }
    };

    const handleSignUp = async (email: string, password: string, fullName: string) => {
        return await supabaseSignUp(email, password, fullName);
    };

    const handleSignOut = async () => {
        await supabaseSignOut();
        setUser(null);
        setProfile(null);
    };

    const isAdmin = profile?.role === 'super_admin';

    const value = {
        user,
        profile,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        isAdmin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
