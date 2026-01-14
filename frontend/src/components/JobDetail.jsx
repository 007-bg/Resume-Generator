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
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [analyzingIds, setAnalyzingIds] = useState(new Set());

    useEffect(() => {
        loadJob();
    }, [jobId]);

    // Poll for analysis status
    useEffect(() => {
        if (!job) return;

        const pendingCandidates = job.candidates.filter(c =>
            analyzingIds.has(c.id) || c.critique_status === 'PROCESSING'
        );

        if (pendingCandidates.length === 0) return;

        const poll = setInterval(loadJob, 3000);
        return () => clearInterval(poll);
    }, [job, analyzingIds]);

    const loadJob = async () => {
        try {
            const data = await getJob(jobId);
            setJob(data);
            setIsLoading(false);

            // Update analyzing set
            const processing = new Set(
                data.candidates
                    .filter(c => c.critique_status === 'PROCESSING')
                    .map(c => c.id)
            );
            setAnalyzingIds(processing);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (formData) => {
        try {
            await uploadCandidate(jobId, formData);
            setShowUploadModal(false);
            loadJob();
        } catch (err) {
            console.error(err);
            alert('Failed to upload candidate');
        }
    };

    const handleDeleteCandidate = async (candidateId) => {
        if (!confirm('Delete this candidate?')) return;
        try {
            await deleteCandidate(candidateId);
            loadJob();
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateCritique = async (candidateId) => {
        try {
            setAnalyzingIds(prev => new Set([...prev, candidateId]));
            await generateCritique(candidateId);
            loadJob();
        } catch (err) {
            console.error(err);
            setAnalyzingIds(prev => {
                const next = new Set(prev);
                next.delete(candidateId);
                return next;
            });
            alert('Failed to start analysis');
        }
    };

    if (isLoading) return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="h-8 w-1/3 bg-muted rounded animate-pulse mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="h-64 bg-card rounded-xl border border-border animate-pulse" />
                <div className="lg:col-span-2 h-96 bg-card rounded-xl border border-border animate-pulse" />
            </div>
        </div>
    );

    if (!job) return <div className="text-center py-20">Job not found</div>;

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <Link to="/jobs" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <Icon icon="mdi:arrow-left" width="16" className="mr-1" />
                    Back to Jobs
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{job.title}</h1>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Icon icon="mdi:domain" width="16" />
                                {job.company}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Icon icon="mdi:clock-outline" width="16" />
                                Posted {new Date(job.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Job Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold mb-4">Job Description</h2>
                        <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
                            {job.description.split('\n').map((line, i) => (
                                <p key={i} className="mb-2">{line}</p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Candidates */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Candidates ({job.candidates.length})</h2>
                        <button className="btn btn-primary gap-2" onClick={() => setShowUploadModal(true)}>
                            <Icon icon="mdi:upload" width="18" />
                            Upload Resume
                        </button>
                    </div>

                    <div className="space-y-4">
                        {job.candidates.length === 0 ? (
                            <div className="text-center py-12 bg-card rounded-xl border border-border border-dashed">
                                <Icon icon="mdi:account-group-outline" width="48" className="text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-muted-foreground">No candidates yet. Upload a resume to get started.</p>
                            </div>
                        ) : (
                            job.candidates.map(candidate => (
                                <div key={candidate.id} className="card p-4 transition-all hover:bg-secondary/10">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                                <Icon icon="mdi:account" width="20" className="text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-lg">{candidate.name || 'Unnamed Candidate'}</h3>
                                                <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Icon icon="mdi:email" width="14" />
                                                        {candidate.email}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Icon icon="mdi:file-document" width="14" />
                                                        {candidate.resume_file.split('/').pop()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDeleteCandidate(candidate.id)}
                                                className="btn btn-secondary text-destructive hover:bg-destructive/10 h-9 w-9 p-0"
                                                title="Delete Candidate"
                                            >
                                                <Icon icon="mdi:delete" width="16" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Analysis Section */}
                                    <div className="mt-4 pt-4 border-t border-border">
                                        {!candidate.critique_status || candidate.critique_status === 'PENDING' ? (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Ready for analysis</span>
                                                <button
                                                    onClick={() => handleGenerateCritique(candidate.id)}
                                                    className="btn btn-primary h-8 text-xs gap-1.5"
                                                    disabled={analyzingIds.has(candidate.id)}
                                                >
                                                    {analyzingIds.has(candidate.id) ? (
                                                        <div className="spinner w-3 h-3" />
                                                    ) : (
                                                        <Icon icon="mdi:flash" width="14" />
                                                    )}
                                                    Analyze Match
                                                </button>
                                            </div>
                                        ) : candidate.critique_status === 'PROCESSING' ? (
                                            <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-400/10 px-3 py-2 rounded-lg">
                                                <div className="spinner w-3 h-3 border-blue-400" />
                                                Analyzing candidate profile against job requirements...
                                            </div>
                                        ) : candidate.critique_status === 'FAILED' ? (
                                            <div className="flex items-center justify-between text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                                                <span className="flex items-center gap-2">
                                                    <Icon icon="mdi:alert-circle" width="16" />
                                                    Analysis failed
                                                </span>
                                                <button
                                                    onClick={() => handleGenerateCritique(candidate.id)}
                                                    className="text-xs hover:underline font-medium"
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${(candidate.match_score || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-500' :
                                                            (candidate.match_score || 0) >= 60 ? 'bg-yellow-500/20 text-yellow-500' :
                                                                'bg-red-500/20 text-red-500'
                                                        }`}>
                                                        <Icon icon="mdi:target" width="14" />
                                                        {candidate.match_score || 0}% Match
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        Analyzed on {new Date(candidate.critique_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedCandidateId(candidate.id)}
                                                    className="btn btn-secondary h-8 text-xs gap-1.5"
                                                >
                                                    <Icon icon="mdi:file-document-outline" width="14" />
                                                    View Report
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {showUploadModal && (
                <UploadModal
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handleUpload}
                />
            )}

            {selectedCandidateId && (
                <CritiqueModal
                    candidateId={selectedCandidateId}
                    candidateName={job.candidates.find(c => c.id === selectedCandidateId)?.name}
                    onClose={() => setSelectedCandidateId(null)}
                />
            )}
        </div>
    );
}

function UploadModal({ onClose, onUpload }) {
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('resume_file', file);
        formData.append('name', name);
        formData.append('email', email);

        await onUpload(formData);
        setIsUploading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Upload Resume</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <Icon icon="mdi:close" width="20" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Candidate Name</label>
                        <input
                            type="text"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Email</label>
                        <input
                            type="email"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Resume File (PDF)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            required
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                            onChange={e => setFile(e.target.files[0])}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isUploading}>
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default JobDetail;
