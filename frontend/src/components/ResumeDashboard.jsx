import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
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
            case 'COMPLETED': return <FiCheckCircle size={16} className="text-emerald-500" />;
            case 'PROCESSING': return <FiClock size={16} className="text-cream" />;
            case 'FAILED': return <FiXCircle size={16} className="text-coral" />;
            default: return <FiClock size={16} className="text-sky/50" />;
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Resume Dashboard</h1>
                    <p className="text-sky/70 mt-2">
                        Generate AI-powered resumes tailored to your target jobs
                    </p>
                </div>

                {isProfileComplete ? (
                    <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)} disabled={!!generating}>
                        {generating ? <span className="spinner" /> : <FiZap size={18} />}
                        {generating ? 'Generating...' : 'Generate Resume'}
                    </button>
                ) : (
                    <Link to="/profile/setup" className="btn btn-primary">
                        Complete Profile First
                    </Link>
                )}
            </div>

            {!isProfileComplete && (
                <div className="card mb-6 border-cream/50 bg-cream/10">
                    <p className="text-cream">
                        <strong>Profile Incomplete:</strong> Complete your profile to generate AI-powered resumes.
                    </p>
                    <Link to="/profile/setup" className="btn btn-primary mt-4">
                        Complete Profile ({completionPercentage || 0}%)
                    </Link>
                </div>
            )}

            {error && (
                <div className="card mb-4 border-coral/50 bg-coral/10">
                    <p className="text-coral">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card">
                            <div className="skeleton h-6 w-3/5 mb-3" />
                            <div className="skeleton h-4 w-2/5 mb-6" />
                            <div className="skeleton h-20" />
                        </div>
                    ))}
                </div>
            ) : resumes.length === 0 ? (
                <div className="card text-center py-12">
                    <FiFileText size={64} className="mx-auto mb-4 text-sky/50" />
                    <h3 className="text-lg font-semibold text-sky/70 mb-2">No resumes yet</h3>
                    <p className="text-sky/50 mb-4">
                        Generate your first AI-powered resume
                    </p>
                    {isProfileComplete && (
                        <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
                            <FiZap size={18} />
                            Generate Resume
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map(resume => (
                        <div key={resume.id} className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(resume.status)}
                                    <h3 className="font-semibold">{resume.title}</h3>
                                </div>
                                {resume.match_score && (
                                    <div className={`score-badge ${getScoreClass(resume.match_score)}`}>
                                        {Math.round(resume.match_score)}%
                                    </div>
                                )}
                            </div>

                            <p className="text-sky/60 text-sm">
                                Created {new Date(resume.created_at).toLocaleDateString()}
                            </p>

                            {resume.status === 'COMPLETED' && (
                                <div className="flex items-center gap-2 mt-6">
                                    <button className="btn btn-primary" onClick={() => handleDownloadPDF(resume)}>
                                        <FiDownload size={16} />
                                        Download PDF
                                    </button>
                                    <button className="btn btn-secondary">
                                        <FiEye size={16} />
                                        Preview
                                    </button>
                                </div>
                            )}

                            {resume.status === 'PROCESSING' && (
                                <div className="flex items-center gap-2 mt-6 text-cream">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
            <div className="bg-navy-dark border border-sky/20 rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-sky/10">
                    <h2 className="text-xl font-bold">Generate New Resume</h2>
                    <button className="btn btn-ghost p-2" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="form-label">Resume Title</label>
                            <input
                                type="text"
                                className="form-input"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g., Software Engineer - Google"
                            />
                        </div>

                        <div>
                            <label className="form-label">Target Job Description (Optional)</label>
                            <textarea
                                className="form-textarea"
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                                placeholder="Paste the job description to tailor your resume..."
                                rows={6}
                            />
                            <p className="text-sky/50 mt-2 text-xs">
                                Adding a job description helps our AI optimize your resume for that specific role.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-6 border-t border-sky/10">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isGenerating}>
                            {isGenerating ? <><span className="spinner" /> Generating...</> : <><FiZap size={18} /> Generate Resume</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResumeDashboard;
