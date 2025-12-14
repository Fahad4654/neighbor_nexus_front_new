'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api as apiFactory } from '@/lib/api';

type User = {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    isAdmin: boolean;
    isVerified: boolean;
    rating_avg: string;
    geo_location: any;
    createdAt: string;
    updatedAt: string;
    profile: {
        id: string;
        bio: string;
        avatarUrl: string;
    };
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const performLogout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        router.push('/');
    }, [router]);

    const api = useMemo(() => {
        // Pass performLogout instead of a function that would cause a re-render
        return apiFactory(performLogout);
    }, [performLogout]);
    
    // Function to load user data from localStorage and update state
    const loadUserFromStorage = useCallback(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            if (storedUser && storedAccessToken && storedRefreshToken) {
                setUser(JSON.parse(storedUser));
                setAccessToken(storedAccessToken);
                setRefreshToken(storedRefreshToken);
            } else {
                // If any item is missing, clear all auth data
                performLogout();
            }
        } catch (error) {
            console.error("Failed to parse auth data from localStorage", error);
            performLogout();
        } finally {
            setIsLoading(false);
        }
    }, [performLogout]);

    useEffect(() => {
        // Initial load
        loadUserFromStorage();

        // Listen for storage changes from other tabs
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'user' || event.key === 'accessToken' || event.key === 'refreshToken') {
                loadUserFromStorage();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadUserFromStorage]);
    
    const logout = useCallback(async () => {
        const currentRefreshToken = localStorage.getItem('refreshToken');
        if (currentRefreshToken) {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                if(backendUrl) {
                    const response = await api.post(`${backendUrl}/auth/logout`, { refreshToken: currentRefreshToken });
                    const result = await response.json();
                    if (result.status !== 'success') {
                        console.error("Server-side logout failed:", result.message);
                    }
                }
            } catch (error) {
                console.error("Logout API call failed, logging out client-side anyway.", error);
            }
        }
        performLogout();
    }, [api, performLogout]);

    const updateUser = useCallback((newUserData: User) => {
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(newUserData));
        // Manually update state for the current tab
        setUser(newUserData);
        // Dispatch a storage event so other tabs (and our own listener) can react.
        // This standardizes the update mechanism.
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'user',
            newValue: JSON.stringify(newUserData)
        }));
    }, []);


    return { user, accessToken, refreshToken, isLoading, logout, api, updateUser };
};
