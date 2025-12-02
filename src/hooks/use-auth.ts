'use client';

import { useState, useEffect } from 'react';

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

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
    };

    return { user, accessToken, refreshToken, isLoading, logout };
};
