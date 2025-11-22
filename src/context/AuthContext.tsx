import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isMockMode } from '../lib/supabase';
import { MOCK_USER } from '../lib/mock-data';

type User = {
    id: string;
    email: string;
    full_name?: string;
    role?: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isMockMode) {
            // Simulate session check
            setTimeout(() => {
                setUser(MOCK_USER);
                setLoading(false);
            }, 500);
        } else {
            // Real Supabase Auth
            supabase?.auth.getSession().then(({ data: { session } }: any) => {
                setUser(session?.user as User | null);
                setLoading(false);
            });

            const {
                data: { subscription },
            } = supabase!.auth.onAuthStateChange((_event: any, session: any) => {
                setUser(session?.user as User | null);
            });

            return () => subscription.unsubscribe();
        }
    }, []);

    const signIn = async () => {
        if (isMockMode) {
            setUser(MOCK_USER);
        } else {
            await supabase?.auth.signInWithOAuth({ provider: 'google' });
        }
    };

    const signOut = async () => {
        if (isMockMode) {
            setUser(null);
        } else {
            await supabase?.auth.signOut();
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
