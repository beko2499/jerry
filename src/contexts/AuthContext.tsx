import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => boolean;
    register: (data: RegisterData) => boolean;
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

// Hardcoded test accounts (frontend only)
const TEST_ACCOUNTS: { user: User; password: string }[] = [
    {
        user: {
            username: 'jerry',
            firstName: 'جيري',
            lastName: 'ادمن',
            phone: '07801234567',
            email: 'jerry@jerry.com',
        },
        password: '1234',
    },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('jerry_user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = (username: string, password: string): boolean => {
        const u = username.trim().toLowerCase();
        const p = password.trim();
        // Check hardcoded accounts
        const account = TEST_ACCOUNTS.find(
            (a) => a.user.username.toLowerCase() === u && a.password === p
        );
        if (account) {
            setUser(account.user);
            localStorage.setItem('jerry_user', JSON.stringify(account.user));
            return true;
        }

        // Check registered accounts in localStorage
        const registeredAccounts: { user: User; password: string }[] = JSON.parse(
            localStorage.getItem('jerry_registered') || '[]'
        );
        const registered = registeredAccounts.find(
            (a) => a.user.username.toLowerCase() === u && a.password === p
        );
        if (registered) {
            setUser(registered.user);
            localStorage.setItem('jerry_user', JSON.stringify(registered.user));
            return true;
        }

        return false;
    };

    const register = (data: RegisterData): boolean => {
        const registeredAccounts: { user: User; password: string }[] = JSON.parse(
            localStorage.getItem('jerry_registered') || '[]'
        );

        // Check if username already exists
        const exists =
            TEST_ACCOUNTS.some((a) => a.user.username.toLowerCase() === data.username.trim().toLowerCase()) ||
            registeredAccounts.some((a) => a.user.username.toLowerCase() === data.username.trim().toLowerCase());

        if (exists) return false;

        const newUser: User = {
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
        };

        registeredAccounts.push({ user: newUser, password: data.password });
        localStorage.setItem('jerry_registered', JSON.stringify(registeredAccounts));

        setUser(newUser);
        localStorage.setItem('jerry_user', JSON.stringify(newUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('jerry_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
