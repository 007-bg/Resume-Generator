/**
 * Custom hook for polling critique status.
 */
import { useState, useEffect, useCallback } from 'react';
import { getCritiqueByTask } from '../api/client';

export const useCritiqueStatus = (taskId, pollingInterval = 2000) => {
    const [status, setStatus] = useState('PENDING');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isPolling, setIsPolling] = useState(false);

    const fetchStatus = useCallback(async () => {
        if (!taskId) return;

        try {
            const data = await getCritiqueByTask(taskId);
            setStatus(data.status);

            if (data.status === 'COMPLETED') {
                setResult(data);
                setIsPolling(false);
            } else if (data.status === 'FAILED') {
                setError(data.error_message || 'Analysis failed');
                setIsPolling(false);
            }
        } catch (err) {
            setError(err.message);
            setIsPolling(false);
        }
    }, [taskId]);

    useEffect(() => {
        if (!taskId) return;

        setIsPolling(true);
        setError(null);
        setResult(null);
        setStatus('PENDING');

        // Initial fetch
        fetchStatus();

        // Set up polling
        const intervalId = setInterval(() => {
            if (status === 'PENDING' || status === 'PROCESSING') {
                fetchStatus();
            } else {
                clearInterval(intervalId);
            }
        }, pollingInterval);

        return () => clearInterval(intervalId);
    }, [taskId, pollingInterval, fetchStatus, status]);

    return { status, result, error, isPolling };
};

export default useCritiqueStatus;
