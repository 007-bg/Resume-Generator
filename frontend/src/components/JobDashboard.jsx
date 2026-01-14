import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Users, Calendar, Trash2 } from 'lucide-react';
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
            <div className="grid-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card">
                        <div className="skeleton" style={{ height: 24, width: '70%', marginBottom: 12 }} />
                        <div className="skeleton" style={{ height: 16, width: '50%', marginBottom: 24 }} />
                        <div className="skeleton" style={{ height: 60, width: '100%' }} />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="card text-center">
                <p style={{ color: 'var(--error)' }}>{error}</p>
                <button className="btn btn-primary mt-md" onClick={loadJobs}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <div>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                        Job Dashboard
                    </h1>
                    <p className="text-secondary mt-sm">
                        Manage job postings and analyze candidate resumes
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={18} />
                    New Job Posting
                </button>
            </div>

            {jobs.length === 0 ? (
                <div className="card empty-state">
                    <Briefcase size={64} className="empty-state-icon" />
                    <h3 className="empty-state-title">No job postings yet</h3>
                    <p className="text-muted mb-md">
                        Create your first job posting to start analyzing resumes
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={18} />
                        Create Job Posting
                    </button>
                </div>
            ) : (
                <div className="grid-3">
                    {jobs.map((job) => (
                        <Link
                            key={job.id}
                            to={`/jobs/${job.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="card" style={{ height: '100%' }}>
                                <div className="card-header">
                                    <h3 className="card-title">{job.title}</h3>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDeleteJob(job.id);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {job.company && (
                                    <p className="card-subtitle">{job.company}</p>
                                )}

                                <p
                                    className="text-secondary mt-md"
                                    style={{
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical'
                                    }}
                                >
                                    {job.description}
                                </p>

                                <div className="flex items-center gap-md mt-lg text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                    <span className="flex items-center gap-sm">
                                        <Users size={14} />
                                        {job.candidate_count || 0} candidates
                                    </span>
                                    <span className="flex items-center gap-sm">
                                        <Calendar size={14} />
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Job Posting</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
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

                        <div className="form-group">
                            <label className="form-label">Company</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="e.g., Acme Corporation"
                            />
                        </div>

                        <div className="form-group">
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

                        <div className="form-group">
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

                    <div className="modal-footer">
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
