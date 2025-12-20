import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import Cookies from 'js-cookie';
import { LoadingScreen } from '@/components/LoadingScreen';

interface User {
    userId: string;
    email: string;
    fullName: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateAvatar: (avatarBase64: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = Cookies.get('user_data');
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(true);

    // Configure axios to include cookies
    axios.defaults.withCredentials = true;
    const API_BASE = `${API_BASE_URL}/api`; // Backend URL

    const checkAuth = async () => {
        try {
            console.log("DEBUG: Checking authentication...");
            // Add a timeout to prevent hanging on the loader screen forever
            const response = await axios.get(`${API_BASE}/auth/me`, { timeout: 10000 });
            setUser(response.data);
            // Refresh the user_data cookie to keep it in sync
            Cookies.set('user_data', JSON.stringify(response.data), { expires: 7 });
            console.log("DEBUG: Auth check successful.");
        } catch (error) {
            console.error("DEBUG: Auth check failed:", error);
            setUser(null);
            Cookies.remove('user_data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
        setUser(response.data.user);
        Cookies.set('user_data', JSON.stringify(response.data.user), { expires: 7 });
    };

    const signup = async (email: string, password: string, fullName: string) => {
        await axios.post(`${API_BASE}/auth/signup`, { email, password, fullName });
    };

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            // Send token to backend
            const response = await axios.post(`${API_BASE}/auth/google`, {
                token: idToken,
                email: result.user.email,
                fullName: result.user.displayName,
                avatar: result.user.photoURL
            });

            setUser(response.data.user);
            Cookies.set('user_data', JSON.stringify(response.data.user), { expires: 7 });
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_BASE}/auth/logout`);
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Logout Error:", error);
            setUser(null);
        }
    };

    const updateAvatar = async (avatarBase64: string) => {
        const response = await axios.post(`${API_BASE}/auth/update-avatar`, { avatar: avatarBase64 });
        if (user) {
            setUser({ ...user, avatar: response.data.avatar });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, updateAvatar }}>
            {loading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
