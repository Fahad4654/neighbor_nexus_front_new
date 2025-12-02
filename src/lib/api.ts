
const refreshToken = async (onLogout: () => void) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const oldRefreshToken = localStorage.getItem('refreshToken');

    if (!backendUrl || !oldRefreshToken) {
        onLogout();
        return null;
    }

    try {
        const response = await fetch(`${backendUrl}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: oldRefreshToken }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to refresh token');
        }

        const { accessToken } = data;
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
    } catch (error) {
        console.error('Token refresh error:', error);
        onLogout();
        return null;
    }
};

const customFetch = async (url: string, options: RequestInit = {}, onLogout: () => void) => {
    let accessToken = localStorage.getItem('accessToken');
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        const newAccessToken = await refreshToken(onLogout);

        if (newAccessToken) {
            const newHeaders = {
                ...options.headers,
                'Authorization': `Bearer ${newAccessToken}`,
                'Content-Type': 'application/json',
            };
            // Retry the request with the new token
            response = await fetch(url, { ...options, headers: newHeaders });
        } else {
            // If refresh fails, we're already logged out by refreshToken function.
            // We can throw an error to stop the current execution flow.
            throw new Error('Session expired. Please log in again.');
        }
    }

    return response;
};

// We wrap the logic in a function that receives the logout callback.
// This avoids circular dependencies and makes the auth flow clearer.
export const api = (onLogout: () => void) => ({
    get: (url: string, options: RequestInit = {}) => customFetch(url, { ...options, method: 'GET' }, onLogout),
    post: (url: string, body: any, options: RequestInit = {}) => customFetch(url, { ...options, method: 'POST', body: JSON.stringify(body) }, onLogout),
    put: (url: string, body: any, options: RequestInit = {}) => customFetch(url, { ...options, method: 'PUT', body: JSON.stringify(body) }, onLogout),
    delete: (url: string, options: RequestInit = {}) => customFetch(url, { ...options, method: 'DELETE' }, onLogout),
});
