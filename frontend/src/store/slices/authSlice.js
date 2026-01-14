/**
 * Auth Slice - Manages authentication state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/token/', { username: email, password });
            const tokens = { access: response.data.access, refresh: response.data.refresh };

            // Set token for subsequent requests
            api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;

            // Fetch user data
            const userResponse = await api.get('/auth/me/');

            return { user: userResponse.data, tokens };
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register/', userData);

            // Set token for subsequent requests
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.access}`;

            return { user: response.data.user, tokens: response.data.tokens };
        } catch (error) {
            const errors = error.response?.data;
            if (errors) {
                const firstError = Object.values(errors)[0];
                return rejectWithValue(Array.isArray(firstError) ? firstError[0] : firstError);
            }
            return rejectWithValue('Registration failed');
        }
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            const response = await api.post('/auth/token/refresh/', {
                refresh: auth.tokens.refresh,
            });

            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

            return { access: response.data.access };
        } catch (error) {
            return rejectWithValue('Token refresh failed');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            if (auth.tokens?.access) {
                api.defaults.headers.common['Authorization'] = `Bearer ${auth.tokens.access}`;
            }
            const response = await api.get('/auth/me/');
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch user');
        }
    }
);

const initialState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.tokens = null;
            state.isAuthenticated = false;
            state.error = null;
            delete api.defaults.headers.common['Authorization'];
        },
        clearError: (state) => {
            state.error = null;
        },
        setTokens: (state, action) => {
            state.tokens = action.payload;
            if (action.payload?.access) {
                api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.access}`;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.tokens = action.payload.tokens;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.tokens = action.payload.tokens;
                state.isAuthenticated = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Refresh Token
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.tokens = { ...state.tokens, access: action.payload.access };
            })
            .addCase(refreshToken.rejected, (state) => {
                state.user = null;
                state.tokens = null;
                state.isAuthenticated = false;
            })
            // Fetch Current User
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.tokens = null;
                state.isAuthenticated = false;
            });
    },
});

export const { logout, clearError, setTokens } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
