/**
 * Resumes Slice - Manages resumes state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

// Async thunks
export const fetchResumes = createAsyncThunk(
    'resumes/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/candidates/');
            return response.data.results || response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch resumes');
        }
    }
);

export const generateResume = createAsyncThunk(
    'resumes/generate',
    async ({ title, job_description }, { rejectWithValue }) => {
        try {
            const response = await api.post('/agents/generate/', { title, job_description });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Generation failed');
        }
    }
);

export const checkResumeStatus = createAsyncThunk(
    'resumes/checkStatus',
    async (resumeId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/agents/status/${resumeId}/`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to check status');
        }
    }
);

const initialState = {
    items: [],
    generating: null, // ID of resume being generated
    loading: false,
    error: null,
};

const resumesSlice = createSlice({
    name: 'resumes',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateResumeInList: (state, action) => {
            const index = state.items.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = { ...state.items[index], ...action.payload };
            }
        },
        clearGenerating: (state) => {
            state.generating = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchResumes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchResumes.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchResumes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(generateResume.pending, (state) => {
                state.error = null;
            })
            .addCase(generateResume.fulfilled, (state, action) => {
                state.generating = action.payload.resume_id;
            })
            .addCase(generateResume.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(checkResumeStatus.fulfilled, (state, action) => {
                if (action.payload.status === 'COMPLETED' || action.payload.status === 'FAILED') {
                    state.generating = null;
                }
                // Update the resume in items if it exists
                const index = state.items.findIndex(r => r.id === action.payload.resume_id);
                if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...action.payload };
                }
            });
    },
});

export const { clearError, updateResumeInList, clearGenerating } = resumesSlice.actions;

// Selectors
export const selectResumes = (state) => state.resumes.items;
export const selectResumesLoading = (state) => state.resumes.loading;
export const selectGenerating = (state) => state.resumes.generating;
export const selectResumesError = (state) => state.resumes.error;

export default resumesSlice.reducer;
