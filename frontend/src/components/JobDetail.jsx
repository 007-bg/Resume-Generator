import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, Upload, User, Mail, FileText,
    Trash2, Zap, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
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
            case 'COMPLETED': return <CheckCircle size={14} />;
            case 'PROCESSING': return <Clock size={14} />;
            case 'FAILED': return <XCircle size={14} />;
            default: return <AlertCircle size={14} />;
        }
    };

    if (isLoading) {
        return (
            <div className="card">
                <div className="skeleton" style={{ height: 32, width: '40%', marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 32 }} />
                <div className="skeleton" style={{ height: 200, width: '100%' }} />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="card text-center">
                <p>Job not found</p>
                <Link to="/" className="btn btn-primary mt-md">Back to Dashboard</Link>
            </div>
        );
    }

    const candidates = job.candidates || [];

    return (
        <div>
            <Link to="/" className="btn btn-ghost mb-md">
                <ArrowLeft size={16} /> Back to Jobs
            </Link>

            <div className="card mb-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                            {job.title}
                        </h1>
                        {job.company && (
                            <p className="text-secondary mt-sm">{job.company}</p>
                        )}
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowUploadModal(true)}
                    >
                        <Upload size={18} />
                        Upload Resume
                    </button>
                </div>

                <p className="text-secondary mt-lg" style={{ whiteSpace: 'pre-wrap' }}>
                    {job.description}
                </p>

                {job.requirements && (
                    <div className="mt-lg">
                        <h4 className="text-secondary mb-sm">Requirements</h4>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mb-md">
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>
                    Candidates ({candidates.length})
                </h2>
            </div>

            {candidates.length === 0 ? (
                <div className="card empty-state">
                    <User size={48} className="empty-state-icon" />
                    <h3 className="empty-state-title">No candidates yet</h3>
                    <p className="text-muted mb-md">Upload resumes to start analyzing</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowUploadModal(true)}
                    >
                        <Upload size={18} />
                        Upload Resume
                    </button>
                </div>
            ) : (
                <div className="grid-2">
                    {candidates.map((candidate) => {
                        const isProcessing = processingIds.has(candidate.id) ||
                            candidate.critique_status === 'PROCESSING';

                        return (
                            <div key={candidate.id} className="card">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-md">
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: 'var(--accent-gradient)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <User size={20} color="white" />
                                        </div>
                                        <div>
                                            <h3 style={{ fontWeight: 600 }}>{candidate.name}</h3>
                                            {candidate.email && (
                                                <p className="text-muted flex items-center gap-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                                                    <Mail size={12} /> {candidate.email}
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

                                <div className="flex items-center gap-md mt-lg">
                                    {candidate.critique_status && (
                                        <span className={`status-badge status-${candidate.critique_status.toLowerCase()}`}>
                                            {getStatusIcon(candidate.critique_status)}
                                            {candidate.critique_status}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-sm mt-md">
                                    {candidate.critique_status === 'COMPLETED' ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setSelectedCandidate(candidate)}
                                        >
                                            <FileText size={16} />
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
                                                    <Zap size={16} />
                                                    Analyze Resume
                                                </>
                                            )}
                                        </button>
                                    )}

                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => handleDelete(candidate.id)}
                                    >
                                        <Trash2 size={16} />
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Upload Resume</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
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

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Resume (PDF) *</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="form-input"
                                required
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
