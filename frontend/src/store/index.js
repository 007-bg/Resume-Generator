/**
 * Redux Store Configuration
 * Central store with persistence for auth state
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import applicationsReducer from './slices/applicationsSlice';
import resumesReducer from './slices/resumesSlice';
import profileReducer from './slices/profileSlice';

// Persist configuration
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['auth'], // Only persist auth state
};

const rootReducer = combineReducers({
    auth: authReducer,
    applications: applicationsReducer,
    resumes: resumesReducer,
    profile: profileReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export default store;
