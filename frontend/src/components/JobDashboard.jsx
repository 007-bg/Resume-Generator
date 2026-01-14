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
            // Handle pagination (DRF returns { count, results: [...] }) or direct array
            const jobList = Array.isArray(data) ? data : (data.results || []);
            setJobs(jobList);
        } catch (err) {
            setError('Failed to load jobs');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateJob = async (jobData) => {
        try {
            await createJob(jobData);
            setShowCreateModal(false);
            loadJobs();
        } catch (err) {
            console.error(err);
            alert('Failed to create job');
        }
    };

    const handleDeleteJob = async (jobId, e) => {
        e.preventDefault(); // Prevent navigation
        if (!confirm('Are you sure you want to delete this job?')) return;

        try {
            await deleteJob(jobId);
            loadJobs();
        } catch (err) {
            console.error(err);
            alert('Failed to delete job');
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Analysis</h1>
                    <p className="text-muted-foreground mt-2">Manage job postings and candidate analysis</p>
                </div>
                <button
                    className="btn btn-primary gap-2"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Icon icon="mdi:plus" width="18" />
                    New Job
                </button>
            </div>

            {error && (
                <div className="p-4 mb-6 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse" />
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border border-border">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Icon icon="mdi:briefcase-outline" className="text-muted-foreground w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No jobs yet</h3>
                    <p className="text-muted-foreground mb-6">Create a job posting to start analyzing candidates</p>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        Create Job
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map(job => (
                        <Link
                            to={`/jobs/${job.id}`}
                            key={job.id}
                            className="card group hover:shadow-lg transition-all duration-200 p-6 flex flex-col h-full bg-card hover:border-primary/50"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                        {job.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{job.company}</p>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteJob(job.id, e)}
                                    className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-colors"
                                >
                                    <Icon icon="mdi:delete" width="18" />
                                </button>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                                {job.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border mt-auto">
                                <span className="flex items-center gap-1.5">
                                    <Icon icon="mdi:calendar" width="14" />
                                    {new Date(job.created_at).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-full text-secondary-foreground font-medium">
                                    <Icon icon="mdi:account-group" width="14" />
                                    {job.candidates_count || 0} Candidates
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateJobModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateJob}
                />
            )}
        </div>
    );
}

function CreateJobModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        requirements: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Create New Job</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <Icon icon="mdi:close" width="20" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Job Title</label>
                        <input
                            type="text"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Senior Frontend Engineer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Company</label>
                        <input
                            type="text"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formData.company}
                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                            placeholder="e.g. Acme Corp"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Description</label>
                        <textarea
                            required
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Paste full job description..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create Job
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default JobDashboard;
