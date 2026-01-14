import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Download, Eye, Zap, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { fetchResumes, generateResume, checkResumeStatus, selectResumes, selectResumesLoading, selectGenerating, selectResumesError, clearError } from '../store/slices/resumesSlice';
import { selectIsProfileComplete, selectCompletionPercentage } from '../store/slices/profileSlice';
import { generateResumePDF } from '../lib/pdfGenerator';

function ResumeDashboard() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const resumes = useSelector(selectResumes);
    const isLoading = useSelector(selectResumesLoading);
    const generating = useSelector(selectGenerating);
    const error = useSelector(selectResumesError);
    const isProfileComplete = useSelector(selectIsProfileComplete);
    const completionPercentage = useSelector(selectCompletionPercentage);

    const [showGenerateModal, setShowGenerateModal] = useState(false);

    useEffect(() => {
        dispatch(fetchResumes());
    }, [dispatch]);

    // Poll for generating resume status
    useEffect(() => {
        if (!generating) return;

        const poll = setInterval(() => {
            dispatch(checkResumeStatus(generating)).then((result) => {
                if (result.payload?.status === 'COMPLETED' || result.payload?.status === 'FAILED') {
                    dispatch(fetchResumes());
                }
            });
        }, 3000);

        return () => clearInterval(poll);
    }, [generating, dispatch]);

    const handleGenerate = async (jobDescription, title) => {
        dispatch(clearError());
        const result = await dispatch(generateResume({
            title: title || `Resume - ${new Date().toLocaleDateString()}`,
            job_description: jobDescription
        }));

        if (!result.error) {
            setShowGenerateModal(false);
        }
    };

    const handleDownloadPDF = async (resume) => {
        try {
            await generateResumePDF(resume.content, {
                filename: `${resume.title.replace(/\s+/g, '_')}.pdf`
            });
        } catch (err) {
            console.error('PDF generation failed:', err);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
            case 'PROCESSING': return <Clock size={16} style={{ color: 'var(--warning)' }} />;
            case 'FAILED': return <XCircle size={16} style={{ color: 'var(--error)' }} />;
            default: return <Clock size={16} style={{ color: 'var(--text-muted)' }} />;
        }
    };

    const getScoreClass = (score) => {
        if (!score) return '';
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        if (score >= 40) return 'score-average';
        return 'score-poor';
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <div>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                        Resume Dashboard
                    </h1>
                    <p className="text-secondary mt-sm">
                        Generate AI-powered resumes tailored to your target jobs
                    </p>
                </div>

                {isProfileComplete ? (
                    <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)} disabled={!!generating}>
                        {generating ? <span className="spinner" /> : <Zap size={18} />}
                        {generating ? 'Generating...' : 'Generate Resume'}
                    </button>
                ) : (
                    <Link to="/profile/setup" className="btn btn-primary">
                        Complete Profile First
                    </Link>
                )}
            </div>

            {!isProfileComplete && (
                <div className="card mb-lg" style={{ borderColor: 'var(--warning)', background: 'var(--warning-bg)' }}>
                    <p style={{ color: 'var(--warning)' }}>
                        <strong>Profile Incomplete:</strong> Complete your profile to generate AI-powered resumes.
                    </p>
                    <Link to="/profile/setup" className="btn btn-primary mt-md">
                        Complete Profile ({completionPercentage || 0}%)
                    </Link>
                </div>
            )}

            {error && (
                <div className="card mb-md" style={{ borderColor: 'var(--error)', background: 'var(--error-bg)' }}>
                    <p style={{ color: 'var(--error)' }}>{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="grid-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card">
                            <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 12 }} />
                            <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 24 }} />
                            <div className="skeleton" style={{ height: 80 }} />
                        </div>
                    ))}
                </div>
            ) : resumes.length === 0 ? (
                <div className="card empty-state">
                    <FileText size={64} className="empty-state-icon" />
                    <h3 className="empty-state-title">No resumes yet</h3>
                    <p className="text-muted mb-md">
                        Generate your first AI-powered resume
                    </p>
                    {isProfileComplete && (
                        <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
                            <Zap size={18} />
                            Generate Resume
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid-3">
                    {resumes.map(resume => (
                        <div key={resume.id} className="card">
                            <div className="card-header">
                                <div className="flex items-center gap-sm">
                                    {getStatusIcon(resume.status)}
                                    <h3 className="card-title">{resume.title}</h3>
                                </div>
                                {resume.match_score && (
                                    <div className={`score-badge ${getScoreClass(resume.match_score)}`}>
                                        {Math.round(resume.match_score)}%
                                    </div>
                                )}
                            </div>

                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Created {new Date(resume.created_at).toLocaleDateString()}
                            </p>

                            {resume.status === 'COMPLETED' && (
                                <div className="flex items-center gap-sm mt-lg">
                                    <button className="btn btn-primary" onClick={() => handleDownloadPDF(resume)}>
                                        <Download size={16} />
                                        Download PDF
                                    </button>
                                    <button className="btn btn-secondary">
                                        <Eye size={16} />
                                        Preview
                                    </button>
                                </div>
                            )}

                            {resume.status === 'PROCESSING' && (
                                <div className="flex items-center gap-sm mt-lg text-warning">
                                    <div className="spinner" />
                                    Generating...
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showGenerateModal && (
                <GenerateModal
                    onClose={() => setShowGenerateModal(false)}
                    onGenerate={handleGenerate}
                    isGenerating={!!generating}
                />
            )}
        </div>
    );
}

function GenerateModal({ onClose, onGenerate, isGenerating }) {
    const [title, setTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerate(jobDescription, title);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Generate New Resume</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Resume Title</label>
                            <input
                                type="text"
                                className="form-input"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g., Software Engineer - Google"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Target Job Description (Optional)</label>
                            <textarea
                                className="form-textarea"
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                                placeholder="Paste the job description to tailor your resume..."
                                rows={6}
                            />
                            <p className="text-muted mt-sm" style={{ fontSize: 'var(--font-size-xs)' }}>
                                Adding a job description helps our AI optimize your resume for that specific role.
                            </p>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isGenerating}>
                            {isGenerating ? <><span className="spinner" /> Generating...</> : <><Zap size={18} /> Generate Resume</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResumeDashboard;
