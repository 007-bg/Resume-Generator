/**
 * Profile Slice - Manages user profile and ground truth
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

// Async thunks
export const fetchProfile = createAsyncThunk(
    'profile/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/profile/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch profile');
        }
    }
);

export const updateGroundTruth = createAsyncThunk(
    'profile/updateGroundTruth',
    async (groundTruth, { rejectWithValue }) => {
        try {
            const response = await api.patch('/auth/profile/ground-truth/', groundTruth);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update profile');
        }
    }
);

const initialState = {
    data: null,
    groundTruth: {},
    completionPercentage: 0,
    isComplete: false,
    loading: false,
    saving: false,
    error: null,
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setLocalGroundTruth: (state, action) => {
            state.groundTruth = { ...state.groundTruth, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        },
        resetProfile: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.groundTruth = action.payload.ground_truth || {};
                state.completionPercentage = action.payload.completion_percentage || 0;
                state.isComplete = action.payload.is_complete || false;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateGroundTruth.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateGroundTruth.fulfilled, (state, action) => {
                state.saving = false;
                state.groundTruth = action.payload.ground_truth;
                state.completionPercentage = action.payload.completion_percentage;
                state.isComplete = action.payload.is_complete;
            })
            .addCase(updateGroundTruth.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });
    },
});

export const { setLocalGroundTruth, clearError, resetProfile } = profileSlice.actions;

// Selectors
export const selectProfile = (state) => state.profile.data;
export const selectGroundTruth = (state) => state.profile.groundTruth;
export const selectCompletionPercentage = (state) => state.profile.completionPercentage;
export const selectIsProfileComplete = (state) => state.profile.isComplete;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileSaving = (state) => state.profile.saving;

export default profileSlice.reducer;
