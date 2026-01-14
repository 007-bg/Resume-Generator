import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { getJobs, createJob, deleteJob } from '../api/client';

function JobDashboard() {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setIsLoading(true);
            const data = await getJobs();
            setJobs(data.results || data);
        } catch (err) {
            setError('Failed to load jobs');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateJob = async (formData) => {
        try {
            await createJob(formData);
            setShowCreateModal(false);
            loadJobs();
        } catch (err) {
            console.error('Failed to create job:', err);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!confirm('Are you sure you want to delete this job posting?')) return;

        try {
            await deleteJob(jobId);
            loadJobs();
        } catch (err) {
            console.error('Failed to delete job:', err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card">
                        <div className="skeleton h-6 w-[70%] mb-3" />
                        <div className="skeleton h-4 w-1/2 mb-6" />
                        <div className="skeleton h-16 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="card text-center py-12">
                <p className="text-coral">{error}</p>
                <button className="btn btn-primary mt-4" onClick={loadJobs}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Job Dashboard</h1>
                    <p className="text-sky/70 mt-2">
                        Manage job postings and analyze candidate resumes
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    <FiPlus size={18} />
                    New Job Posting
                </button>
            </div>

            {jobs.length === 0 ? (
                <div className="card text-center py-12">
                    <FiBriefcase size={64} className="mx-auto mb-4 text-sky/50" />
                    <h3 className="text-lg font-semibold text-sky/70 mb-2">No job postings yet</h3>
                    <p className="text-sky/50 mb-4">
                        Create your first job posting to start analyzing resumes
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <FiPlus size={18} />
                        Create Job Posting
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <Link
                            key={job.id}
                            to={`/jobs/${job.id}`}
                            className="no-underline"
                        >
                            <div className="card h-full hover:-translate-y-1 transition-transform">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">{job.title}</h3>
                                    <button
                                        className="btn btn-ghost p-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDeleteJob(job.id);
                                        }}
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>

                                {job.company && (
                                    <p className="text-sky/70 text-sm">{job.company}</p>
                                )}

                                <p className="text-sky/60 mt-4 text-sm line-clamp-3">
                                    {job.description}
                                </p>

                                <div className="flex items-center gap-4 mt-6 text-sky/50 text-sm">
                                    <span className="flex items-center gap-1">
                                        <FiUsers size={14} />
                                        {job.candidate_count || 0} candidates
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiCalendar size={14} />
                                        {formatDate(job.created_at)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateJobModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateJob}
                />
            )}
        </div>
    );
}

// Create Job Modal Component
function CreateJobModal({ onClose, onCreate }) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        requirements: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onCreate(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
            <div className="bg-navy-dark border border-sky/20 rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-sky/10">
                    <h2 className="text-xl font-bold">Create Job Posting</h2>
                    <button className="btn btn-ghost p-2" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="form-label">Job Title *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Senior Software Engineer"
                                required
                            />
                        </div>

                        <div>
                            <label className="form-label">Company</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="e.g., Acme Corporation"
                            />
                        </div>

                        <div>
                            <label className="form-label">Job Description *</label>
                            <textarea
                                className="form-textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the role, responsibilities, and ideal candidate..."
                                required
                                rows={5}
                            />
                        </div>

                        <div>
                            <label className="form-label">Requirements</label>
                            <textarea
                                className="form-textarea"
                                value={formData.requirements}
                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                placeholder="List specific qualifications, skills, and experience required..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-6 border-t border-sky/10">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || !formData.title || !formData.description}
                        >
                            {isSubmitting ? <span className="spinner" /> : 'Create Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default JobDashboard;
