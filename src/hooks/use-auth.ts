'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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

    const performLogout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        // Redirect to login page, ensuring it runs only on the client.
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }, []);

    const api = useMemo(() => {
        // Pass performLogout instead of a function that would cause a re-render
        return apiFactory(performLogout);
    }, [performLogout]);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            if (storedUser && storedAccessToken && storedRefreshToken) {
                setUser(JSON.parse(storedUser));
                setAccessToken(storedAccessToken);
                setRefreshToken(storedRefreshToken);
            }
        } catch (error) {
            console.error("Failed to parse auth data from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const logout = useCallback(async () => {
        const currentRefreshToken = localStorage.getItem('refreshToken');
        if (currentRefreshToken) {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                if(backendUrl) {
                    await api.post(`${backendUrl}/auth/logout`, { refreshToken: currentRefreshToken });
                }
            } catch (error) {
                console.error("Logout API call failed, logging out client-side anyway.", error);
            }
        }
        performLogout();
    }, [api, performLogout]);


    return { user, accessToken, refreshToken, isLoading, logout, api };
};
