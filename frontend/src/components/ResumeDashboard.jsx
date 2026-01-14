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
    // eslint-disable-next-line no-unused-vars
    const user = useSelector(selectUser);
    const resumes = useSelector(selectResumes);
    const isLoading = useSelector(selectResumesLoading);
    const generating = useSelector(selectGenerating);
    // eslint-disable-next-line no-unused-vars
    const error = useSelector(selectResumesError);
    const isProfileComplete = useSelector(selectIsProfileComplete);
    // eslint-disable-next-line no-unused-vars
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
            case 'COMPLETED': return <Icon icon="mdi:check-circle" width="16" className="text-emerald-500" />;
            case 'PROCESSING': return <Icon icon="mdi:clock-outline" width="16" className="text-secondary-foreground" />;
            case 'FAILED': return <Icon icon="mdi:close-circle" width="16" className="text-destructive" />;
            default: return <Icon icon="mdi:clock-outline" width="16" className="text-muted-foreground" />;
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
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resume Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Generate AI-powered resumes tailored to your target jobs
                    </p>
                </div>

                {isProfileComplete ? (
                    <button className="btn btn-primary gap-2" onClick={() => setShowGenerateModal(true)} disabled={!!generating}>
                        {generating ? <div className="spinner w-4 h-4 border-current" /> : <Icon icon="mdi:flash" width="18" />}
                        {generating ? 'Generating...' : 'Generate Resume'}
                    </button>
                ) : (
                    <Link to="/profile/setup" className="btn btn-primary">
                        Complete Profile First
                    </Link>
                )}
            </div>

            {/* Resume List */}
            {isLoading && resumes.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card h-64 animate-pulse">
                            <div className="h-full bg-muted/50 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : resumes.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border border-border shadow-sm">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon icon="mdi:file-document-outline" width="32" className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Create your first AI-tailored resume by pasting a job description.
                    </p>
                    {isProfileComplete ? (
                        <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
                            Generate Resume
                        </button>
                    ) : (
                        <Link to="/profile/setup" className="btn btn-primary">
                            Setup Profile
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map(resume => (
                        <div key={resume.id} className="card group hover:shadow-lg transition-all duration-200">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="mb-2">
                                        <h3 className="font-semibold text-lg line-clamp-1" title={resume.title}>
                                            {resume.title}
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(resume.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {getStatusIcon(resume.status)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-6">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-secondary text-secondary-foreground`}>
                                        Match Score: {resume.match_score || 'N/A'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-border">
                                    <button
                                        className="btn btn-secondary flex-1 text-xs h-8"
                                        onClick={() => window.open(`/resumes/${resume.id}`, '_blank')}
                                    >
                                        <Icon icon="mdi:eye" width="14" /> View
                                    </button>
                                    <button
                                        className="btn btn-primary flex-1 text-xs h-8"
                                        onClick={() => handleDownloadPDF(resume)}
                                        disabled={resume.status !== 'COMPLETED'}
                                    >
                                        <Icon icon="mdi:download" width="14" /> Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Generate Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border p-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Generate New Resume</h2>
                            <button
                                onClick={() => setShowGenerateModal(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Icon icon="mdi:close" width="20" />
                            </button>
                        </div>

                        <GenerateForm onSubmit={handleGenerate} onCancel={() => setShowGenerateModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

function GenerateForm({ onSubmit, onCancel }) {
    const [jobDescription, setJobDescription] = useState('');
    const [title, setTitle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (jobDescription.trim()) {
            onSubmit(jobDescription, title);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Resume Title (Optional)</label>
                <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g. Frontend Developer @ Google"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Job Description</label>
                <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={onCancel} className="btn btn-secondary">
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    Generate Resume
                </button>
            </div>
        </form>
    );
}

export default ResumeDashboard;
