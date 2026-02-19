
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithCredentials: (username: string, pass: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    loginWithCredentials: async () => ({ success: false }),
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedAuth = localStorage.getItem('lava_admin_auth');
        if (storedAuth) {
            setUser({ email: 'admin@lava.com', uid: 'admin-local' } as User);
        }
        setLoading(false);
    }, []);

    const loginWithCredentials = async (username: string, pass: string) => {
        // Simple local auth
        if (username === 'admin' && pass === '123456') {
            setUser({ email: 'admin@lava.com', uid: 'admin-local' } as User);
            localStorage.setItem('lava_admin_auth', 'true');
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials. Use admin / 123456' };
    };

    const logout = async () => {
        localStorage.removeItem('lava_admin_auth');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, loginWithCredentials } as any}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
