import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    balance: number;
    role: string;
}

interface RegisterResult {
    success: boolean;
    error?: string;
    userId?: string;
    email?: string;
}

interface LoginResult {
    success: boolean;
    error?: string;
    userId?: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<LoginResult>;
    register: (data: RegisterData) => Promise<RegisterResult>;
    verifyEmail: (userId: string, code: string) => Promise<{ success: boolean; error?: string }>;
    resendCode: (userId: string) => Promise<boolean>;
    logout: () => void;
}

interface RegisterData {
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('jerry_user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = async (username: string, password: string): Promise<LoginResult> => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (res.status === 403 && data.error === 'not_verified') {
                return { success: false, error: 'not_verified', userId: data.userId, email: data.email };
            }
            if (!res.ok) return { success: false, error: 'invalid_credentials' };
            setUser(data.user);
            localStorage.setItem('jerry_user', JSON.stringify(data.user));
            return { success: true };
        } catch {
            return { success: false, error: 'connection_error' };
        }
    };

    const register = async (data: RegisterData): Promise<RegisterResult> => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (!res.ok) return { success: false, error: result.error };
            return { success: true, userId: result.userId, email: result.email };
        } catch {
            return { success: false, error: 'connection_error' };
        }
    };

    const verifyEmail = async (userId: string, code: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code }),
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error };
            return { success: true };
        } catch {
            return { success: false, error: 'connection_error' };
        }
    };

    const resendCode = async (userId: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/resend-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            return res.ok;
        } catch {
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('jerry_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, verifyEmail, resendCode, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
