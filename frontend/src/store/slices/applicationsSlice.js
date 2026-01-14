/**
 * Applications Slice - Manages job applications state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

// Async thunks
export const fetchApplications = createAsyncThunk(
    'applications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/applications/');
            return response.data.results || response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch applications');
        }
    }
);

export const fetchApplicationStats = createAsyncThunk(
    'applications/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/applications/stats/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch stats');
        }
    }
);

export const fetchApplicationsByStatus = createAsyncThunk(
    'applications/fetchByStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/applications/by_status/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch applications');
        }
    }
);

export const createApplication = createAsyncThunk(
    'applications/create',
    async (applicationData, { rejectWithValue }) => {
        try {
            const response = await api.post('/applications/', applicationData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create application');
        }
    }
);

export const updateApplication = createAsyncThunk(
    'applications/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/applications/${id}/`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update application');
        }
    }
);

export const updateApplicationStatus = createAsyncThunk(
    'applications/updateStatus',
    async ({ id, status, notes }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/applications/${id}/update_status/`, { status, notes });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update status');
        }
    }
);

export const deleteApplication = createAsyncThunk(
    'applications/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/applications/${id}/`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete application');
        }
    }
);

export const toggleFavorite = createAsyncThunk(
    'applications/toggleFavorite',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`/applications/${id}/toggle_favorite/`);
            return { id, is_favorite: response.data.is_favorite };
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to toggle favorite');
        }
    }
);

const initialState = {
    items: [],
    stats: null,
    byStatus: {},
    loading: false,
    error: null,
    statusFilter: 'all',
    viewMode: 'list', // 'list' or 'kanban'
};

const applicationsSlice = createSlice({
    name: 'applications',
    initialState,
    reducers: {
        setStatusFilter: (state, action) => {
            state.statusFilter = action.payload;
        },
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchApplications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Stats
            .addCase(fetchApplicationStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            // Fetch By Status
            .addCase(fetchApplicationsByStatus.fulfilled, (state, action) => {
                state.byStatus = action.payload;
            })
            // Create
            .addCase(createApplication.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            // Update
            .addCase(updateApplication.fulfilled, (state, action) => {
                const index = state.items.findIndex(app => app.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            // Update Status
            .addCase(updateApplicationStatus.fulfilled, (state, action) => {
                const index = state.items.findIndex(app => app.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            // Delete
            .addCase(deleteApplication.fulfilled, (state, action) => {
                state.items = state.items.filter(app => app.id !== action.payload);
            })
            // Toggle Favorite
            .addCase(toggleFavorite.fulfilled, (state, action) => {
                const index = state.items.findIndex(app => app.id === action.payload.id);
                if (index !== -1) state.items[index].is_favorite = action.payload.is_favorite;
            });
    },
});

export const { setStatusFilter, setViewMode, clearError } = applicationsSlice.actions;

// Selectors
export const selectApplications = (state) => state.applications.items;
export const selectApplicationStats = (state) => state.applications.stats;
export const selectApplicationsLoading = (state) => state.applications.loading;
export const selectStatusFilter = (state) => state.applications.statusFilter;
export const selectViewMode = (state) => state.applications.viewMode;

export const selectFilteredApplications = (state) => {
    const { items, statusFilter } = state.applications;
    if (statusFilter === 'all') return items;
    return items.filter(app => app.status === statusFilter);
};

export default applicationsSlice.reducer;
