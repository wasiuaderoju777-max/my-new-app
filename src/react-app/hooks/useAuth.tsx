import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signUp: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
    signIn: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse>;
    sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        user,
        session,
        loading,
        signOut: async () => {
            await supabase.auth.signOut();
        },
        signUp: async (credentials: SignUpWithPasswordCredentials) => {
            const response = await supabase.auth.signUp(credentials);
            if (response.error) throw response.error;
            return response;
        },
        signIn: async (credentials: SignInWithPasswordCredentials) => {
            const response = await supabase.auth.signInWithPassword(credentials);
            if (response.error) throw response.error;
            return response;
        },
        sendPasswordResetEmail: async (email: string) => {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
        },
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
