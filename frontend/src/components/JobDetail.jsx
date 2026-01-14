import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { getJob, uploadCandidate, deleteCandidate, generateCritique } from '../api/client';
import CritiqueModal from './CritiqueModal';

function JobDetail() {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [processingIds, setProcessingIds] = useState(new Set());

    useEffect(() => {
        loadJob();
    }, [jobId]);

    const loadJob = async () => {
        try {
            setIsLoading(true);
            const data = await getJob(jobId);
            setJob(data);
        } catch (err) {
            console.error('Failed to load job:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (name, email, file) => {
        try {
            await uploadCandidate(jobId, name, email, file);
            setShowUploadModal(false);
            loadJob();
        } catch (err) {
            console.error('Failed to upload:', err);
        }
    };

    const handleDelete = async (candidateId) => {
        if (!confirm('Delete this candidate?')) return;
        try {
            await deleteCandidate(candidateId);
            loadJob();
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const handleGenerateCritique = async (candidateId) => {
        try {
            setProcessingIds((prev) => new Set([...prev, candidateId]));
            await generateCritique(candidateId);
            // Start polling by refreshing occasionally
            const pollInterval = setInterval(() => {
                loadJob();
            }, 3000);

            // Stop polling after 2 minutes
            setTimeout(() => clearInterval(pollInterval), 120000);
        } catch (err) {
            console.error('Failed to generate critique:', err);
            setProcessingIds((prev) => {
                const next = new Set(prev);
                next.delete(candidateId);
                return next;
            });
        }
    };

    const getScoreClass = (score) => {
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        if (score >= 40) return 'score-average';
        return 'score-poor';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <FiCheckCircle size={14} />;
            case 'PROCESSING': return <FiClock size={14} />;
            case 'FAILED': return <FiXCircle size={14} />;
            default: return <FiAlertCircle size={14} />;
        }
    };

    if (isLoading) {
        return (
            <div className="card">
                <div className="skeleton h-8 w-2/5 mb-4" />
                <div className="skeleton h-5 w-[30%] mb-8" />
                <div className="skeleton h-52 w-full" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="card text-center py-12">
                <p className="text-sky/70">Job not found</p>
                <Link to="/jobs" className="btn btn-primary mt-4">Back to Dashboard</Link>
            </div>
        );
    }

    const candidates = job.candidates || [];

    return (
        <div>
            <Link to="/jobs" className="btn btn-ghost mb-4">
                <FiArrowLeft size={16} /> Back to Jobs
            </Link>

            <div className="card mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{job.title}</h1>
                        {job.company && (
                            <p className="text-sky/70 mt-2">{job.company}</p>
                        )}
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowUploadModal(true)}
                    >
                        <FiUpload size={18} />
                        Upload Resume
                    </button>
                </div>

                <p className="text-sky/60 mt-6 whitespace-pre-wrap">
                    {job.description}
                </p>

                {job.requirements && (
                    <div className="mt-6">
                        <h4 className="text-sky/70 font-medium mb-2">Requirements</h4>
                        <p className="whitespace-pre-wrap">{job.requirements}</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                    Candidates ({candidates.length})
                </h2>
            </div>

            {candidates.length === 0 ? (
                <div className="card text-center py-12">
                    <FiUser size={48} className="mx-auto mb-4 text-sky/50" />
                    <h3 className="text-lg font-semibold text-sky/70 mb-2">No candidates yet</h3>
                    <p className="text-sky/50 mb-4">Upload resumes to start analyzing</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowUploadModal(true)}
                    >
                        <FiUpload size={18} />
                        Upload Resume
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {candidates.map((candidate) => {
                        const isProcessing = processingIds.has(candidate.id) ||
                            candidate.critique_status === 'PROCESSING';

                        return (
                            <div key={candidate.id} className="card">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center">
                                            <FiUser size={20} color="white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{candidate.name}</h3>
                                            {candidate.email && (
                                                <p className="text-sky/60 text-sm flex items-center gap-1">
                                                    <FiMail size={12} /> {candidate.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {candidate.overall_score !== null && (
                                        <div className={`score-badge ${getScoreClass(candidate.overall_score)}`}>
                                            {Math.round(candidate.overall_score)}%
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mt-6">
                                    {candidate.critique_status && (
                                        <span className={`status-badge status-${candidate.critique_status.toLowerCase()}`}>
                                            {getStatusIcon(candidate.critique_status)}
                                            {candidate.critique_status}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-4">
                                    {candidate.critique_status === 'COMPLETED' ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setSelectedCandidate(candidate)}
                                        >
                                            <FiFileText size={16} />
                                            View Analysis
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleGenerateCritique(candidate.id)}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <span className="spinner" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <FiZap size={16} />
                                                    Analyze Resume
                                                </>
                                            )}
                                        </button>
                                    )}

                                    <button
                                        className="btn btn-ghost p-2"
                                        onClick={() => handleDelete(candidate.id)}
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showUploadModal && (
                <UploadModal
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handleUpload}
                />
            )}

            {selectedCandidate && (
                <CritiqueModal
                    candidateId={selectedCandidate.id}
                    candidateName={selectedCandidate.name}
                    onClose={() => setSelectedCandidate(null)}
                />
            )}
        </div>
    );
}

// Upload Modal Component
function UploadModal({ onClose, onUpload }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setIsSubmitting(true);
        try {
            await onUpload(name, email, file);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
            <div className="bg-navy-dark border border-sky/20 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-sky/10">
                    <h2 className="text-xl font-bold">Upload Resume</h2>
                    <button className="btn btn-ghost p-2" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="form-label">Candidate Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="form-label">Resume (PDF) *</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="form-input file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-coral file:text-white hover:file:bg-coral-dark"
                                required
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
                            disabled={isSubmitting || !name || !file}
                        >
                            {isSubmitting ? <span className="spinner" /> : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default JobDetail;
