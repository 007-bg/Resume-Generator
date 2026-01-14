/**
 * OAuth Callback Component
 * Handles the redirect from OAuth providers and stores JWT tokens
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTokens, fetchCurrentUser } from '../../store/slices/authSlice';

function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [status, setStatus] = useState('Processing...');

    useEffect(() => {
        const accessToken = searchParams.get('access');
        const refreshToken = searchParams.get('refresh');

        if (accessToken && refreshToken) {
            // Store tokens in Redux
            dispatch(setTokens({ access: accessToken, refresh: refreshToken }));

            // Fetch user data
            dispatch(fetchCurrentUser())
                .then(() => {
                    setStatus('Success! Redirecting...');
                    setTimeout(() => navigate('/dashboard'), 500);
                })
                .catch(() => {
                    setStatus('Error loading user data');
                    setTimeout(() => navigate('/login'), 2000);
                });
        } else {
            setStatus('Authentication failed. Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [searchParams, dispatch, navigate]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
            <div className="spinner w-12 h-12" />
            <p className="text-lg text-gray-400">{status}</p>
            <p className="text-sm text-gray-600">
                Setting up your account with a unique fancy username...
            </p>
        </div>
    );
}

export default OAuthCallback;
