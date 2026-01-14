/**
 * API client for communicating with Django backend.
 */
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add CSRF token to requests
api.interceptors.request.use((config) => {
    const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='))
        ?.split('=')[1];

    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
        config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
});

// ===== Job Postings =====

export const getJobs = async () => {
    const response = await api.get('/jobs/');
    return response.data;
};

export const getJob = async (id) => {
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
};

export const createJob = async (data) => {
    const response = await api.post('/jobs/', data);
    return response.data;
};

export const updateJob = async (id, data) => {
    const response = await api.put(`/jobs/${id}/`, data);
    return response.data;
};

export const deleteJob = async (id) => {
    await api.delete(`/jobs/${id}/`);
};

// ===== Candidates =====

export const getCandidates = async (jobId = null) => {
    const params = jobId ? { job_id: jobId } : {};
    const response = await api.get('/candidates/', { params });
    return response.data;
};

export const getCandidate = async (id) => {
    const response = await api.get(`/candidates/${id}/`);
    return response.data;
};

export const uploadCandidate = async (jobId, name, email, resumeFile) => {
    const formData = new FormData();
    formData.append('job_posting', jobId);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('resume_file', resumeFile);

    const response = await api.post('/candidates/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteCandidate = async (id) => {
    await api.delete(`/candidates/${id}/`);
};

// ===== Critiques =====

export const generateCritique = async (candidateId, jobId = null) => {
    const data = jobId ? { job_id: jobId } : {};
    const response = await api.post(`/candidates/${candidateId}/generate_critique/`, data);
    return response.data;
};

export const getCritiqueByTask = async (taskId) => {
    const response = await api.get(`/critiques/by_task/${taskId}/`);
    return response.data;
};

export const getCritique = async (id) => {
    const response = await api.get(`/critiques/${id}/`);
    return response.data;
};

export default api;
