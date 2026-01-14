/**
 * Authentication Context for React app.
 * Manages JWT tokens and user state.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [tokens, setTokens] = useState(() => {
        const stored = localStorage.getItem('tokens');
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(true);

    // Set auth header when tokens change
    useEffect(() => {
        if (tokens?.access) {
            api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
            localStorage.setItem('tokens', JSON.stringify(tokens));
        } else {
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('tokens');
        }
    }, [tokens]);

    // Fetch current user on mount
    useEffect(() => {
        const fetchUser = async () => {
            if (!tokens?.access) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/me/');
                setUser(response.data);
            } catch (error) {
                // Token might be expired, try refresh
                if (error.response?.status === 401 && tokens?.refresh) {
                    await refreshToken();
                } else {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/token/', {
            username: email,
            password
        });

        setTokens({
            access: response.data.access,
            refresh: response.data.refresh,
        });

        // Fetch user data
        const userResponse = await api.get('/auth/me/', {
            headers: { Authorization: `Bearer ${response.data.access}` }
        });
        setUser(userResponse.data);

        return userResponse.data;
    };

    const register = async (userData) => {
        const response = await api.post('/auth/register/', userData);

        setTokens(response.data.tokens);
        setUser(response.data.user);

        return response.data.user;
    };

    const logout = useCallback(() => {
        setUser(null);
        setTokens(null);
        localStorage.removeItem('tokens');
    }, []);

    const refreshToken = async () => {
        try {
            const response = await api.post('/auth/token/refresh/', {
                refresh: tokens.refresh,
            });

            setTokens(prev => ({
                ...prev,
                access: response.data.access,
            }));

            return response.data.access;
        } catch (error) {
            logout();
            throw error;
        }
    };

    // Axios interceptor for token refresh
    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry && tokens?.refresh) {
                    originalRequest._retry = true;

                    try {
                        const newToken = await refreshToken();
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        return api(originalRequest);
                    } catch (refreshError) {
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => api.interceptors.response.eject(interceptor);
    }, [tokens?.refresh]);

    const value = {
        user,
        tokens,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshToken,
        api,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
