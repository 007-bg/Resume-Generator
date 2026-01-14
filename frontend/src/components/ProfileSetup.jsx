import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import {
    fetchProfile,
    updateGroundTruth,
    setLocalGroundTruth,
    selectGroundTruth,
    selectProfileSaving,
    selectProfileLoading
} from '../store/slices/profileSlice';

function ProfileSetup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // eslint-disable-next-line no-unused-vars
    const user = useSelector(selectUser);
    const groundTruth = useSelector(selectGroundTruth);
    const saving = useSelector(selectProfileSaving);
    const loading = useSelector(selectProfileLoading);

    const [step, setStep] = useState(1);
    const [localData, setLocalData] = useState({
        personal_info: {},
        summary: '',
        experience: [],
        education: [],
        skills: { technical: [], soft: [], languages: [] },
        certifications: [],
        projects: []
    });

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    // Reset localData when groundTruth changes
    useEffect(() => {
        if (groundTruth && Object.keys(groundTruth).length > 0) {
            setLocalData(prev => ({ ...prev, ...groundTruth }));
        }
    }, [groundTruth]);

    const updateField = (section, field, value) => {
        setLocalData(prev => ({
            ...prev,
            [section]: typeof field === 'string'
                ? { ...prev[section], [field]: value }
                : value
        }));
    };

    const addItem = (section) => {
        const templates = {
            experience: { title: '', company: '', location: '', start_date: '', end_date: '', description: '', achievements: [] },
            education: { degree: '', institution: '', location: '', graduation_date: '', gpa: '' },
            certifications: { name: '', issuer: '', date: '' },
            projects: { name: '', description: '', url: '', technologies: [] }
        };

        setLocalData(prev => ({
            ...prev,
            [section]: [...(prev[section] || []), templates[section]]
        }));
    };

    const removeItem = (section, index) => {
        setLocalData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const updateItem = (section, index, field, value) => {
        setLocalData(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleSave = async () => {
        const result = await dispatch(updateGroundTruth(localData));

        if (!result.error) {
            if (step < 5) {
                setStep(step + 1);
            } else {
                navigate('/dashboard');
            }
        }
    };

    const steps = [
        { icon: "mdi:account", label: 'Personal Info' },
        { icon: "mdi:briefcase", label: 'Experience' },
        { icon: "mdi:school", label: 'Education' },
        { icon: "mdi:code-tags", label: 'Skills' },
        { icon: "mdi:certificate", label: 'Review' }
    ];

    if (loading && !localData.personal_info.full_name) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="spinner w-8 h-8 border-primary" />
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Build Your Master Profile</h1>
                <p className="text-muted-foreground text-lg">
                    This "Ground Truth" data will be used to generate tailored resumes.
                </p>
            </div>

            {/* Stepper */}
            <div className="flex justify-between mb-10 relative px-4">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -z-10 -translate-y-1/2" />
                {steps.map((s, i) => (
                    <div
                        key={i}
                        className={`flex flex-col items-center gap-2 cursor-pointer transition-colors ${i + 1 === step ? 'text-primary' : i + 1 < step ? 'text-green-500' : 'text-muted-foreground'}`}
                        onClick={() => setStep(i + 1)}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background transition-all ${i + 1 === step ? 'border-primary shadow-glow' :
                                i + 1 < step ? 'border-green-500 bg-green-500/10' :
                                    'border-secondary bg-secondary'
                            }`}>
                            <Icon icon={i + 1 < step ? "mdi:check" : s.icon} width="20" />
                        </div>
                        <span className="text-xs font-medium hidden sm:block">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Content Card */}
            <div className="card p-6 md:p-8 animate-fade-in-up">
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Icon icon="mdi:account" className="text-primary" width="24" />
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={localData.personal_info?.full_name || ''}
                                    onChange={e => updateField('personal_info', 'full_name', e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email</label>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={localData.personal_info?.email || ''}
                                    onChange={e => updateField('personal_info', 'email', e.target.value)}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Phone</label>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={localData.personal_info?.phone || ''}
                                    onChange={e => updateField('personal_info', 'phone', e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Location</label>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={localData.personal_info?.location || ''}
                                    onChange={e => updateField('personal_info', 'location', e.target.value)}
                                    placeholder="City, State"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1.5">LinkedIn / Portfolio URL</label>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={localData.personal_info?.linkedin || ''}
                                    onChange={e => updateField('personal_info', 'linkedin', e.target.value)}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1.5">Professional Summary</label>
                                <textarea className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={localData.summary || ''}
                                    onChange={e => updateField('summary', null, e.target.value)}
                                    placeholder="Brief overview of your professional background..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Icon icon="mdi:briefcase" className="text-primary" width="24" />
                                Work Experience
                            </h2>
                            <button className="btn btn-secondary text-xs gap-1" onClick={() => addItem('experience')}>
                                <Icon icon="mdi:plus" width="16" /> Add Experience
                            </button>
                        </div>

                        {localData.experience?.map((exp, idx) => (
                            <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/20 relative group">
                                <button className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100" onClick={() => removeItem('experience', idx)}>
                                    <Icon icon="mdi:delete" width="18" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Job Title"
                                        value={exp.title}
                                        onChange={e => updateItem('experience', idx, 'title', e.target.value)}
                                    />
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Company"
                                        value={exp.company}
                                        onChange={e => updateItem('experience', idx, 'company', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Start Date"
                                        value={exp.start_date}
                                        onChange={e => updateItem('experience', idx, 'start_date', e.target.value)}
                                    />
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="End Date"
                                        value={exp.end_date}
                                        onChange={e => updateItem('experience', idx, 'end_date', e.target.value)}
                                    />
                                </div>
                                <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Key responsibilities and achievements..."
                                    value={exp.description}
                                    onChange={e => updateItem('experience', idx, 'description', e.target.value)}
                                />
                            </div>
                        ))}
                        {localData.experience?.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground bg-secondary/10 rounded-lg border border-dashed border-border">
                                No experience added yet.
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Icon icon="mdi:school" className="text-primary" width="24" />
                                Education
                            </h2>
                            <button className="btn btn-secondary text-xs gap-1" onClick={() => addItem('education')}>
                                <Icon icon="mdi:plus" width="16" /> Add Education
                            </button>
                        </div>

                        {localData.education?.map((edu, idx) => (
                            <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/20 relative group">
                                <button className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100" onClick={() => removeItem('education', idx)}>
                                    <Icon icon="mdi:delete" width="18" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Degree"
                                        value={edu.degree}
                                        onChange={e => updateItem('education', idx, 'degree', e.target.value)}
                                    />
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Institution/School"
                                        value={edu.institution}
                                        onChange={e => updateItem('education', idx, 'institution', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Graduation Year"
                                        value={edu.graduation_date}
                                        onChange={e => updateItem('education', idx, 'graduation_date', e.target.value)}
                                    />
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="GPA (Optional)"
                                        value={edu.gpa}
                                        onChange={e => updateItem('education', idx, 'gpa', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Icon icon="mdi:code-tags" className="text-primary" width="24" />
                            Skills
                        </h2>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Technical Skills (Comma separated)</label>
                            <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="React, Python, AWS, Docker..."
                                value={Array.isArray(localData.skills?.technical) ? localData.skills.technical.join(', ') : localData.skills?.technical || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    setLocalData(prev => ({
                                        ...prev,
                                        skills: { ...prev.skills, technical: val.split(',').map(s => s.trim()) }
                                    }));
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Soft Skills (Comma separated)</label>
                            <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Leadership, Communication, Problem Solving..."
                                value={Array.isArray(localData.skills?.soft) ? localData.skills.soft.join(', ') : localData.skills?.soft || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    setLocalData(prev => ({
                                        ...prev,
                                        skills: { ...prev.skills, soft: val.split(',').map(s => s.trim()) }
                                    }));
                                }}
                            />
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Icon icon="mdi:checkbox-marked-circle-outline" className="text-primary" width="24" />
                            Review
                        </h2>

                        <div className="bg-secondary/20 p-6 rounded-lg border border-border">
                            <h3 className="font-bold text-lg mb-4 text-foreground">Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
                                <div><span className="text-muted-foreground">Name:</span> {localData.personal_info?.full_name}</div>
                                <div><span className="text-muted-foreground">Experience:</span> {localData.experience?.length} entries</div>
                                <div><span className="text-muted-foreground">Education:</span> {localData.education?.length} entries</div>
                                <div><span className="text-muted-foreground">Technical Skills:</span> {localData.skills?.technical?.length || 0}</div>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Click Save to update your "Ground Truth" profile. This will serve as the foundation for all AI-generated resumes.
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-8">
                <button
                    className="btn btn-secondary px-6"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                >
                    Back
                </button>
                <button
                    className="btn btn-primary px-8 gap-2"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? <div className="spinner w-4 h-4 border-white" /> : <Icon icon="mdi:content-save" width="18" />}
                    {step === 5 ? 'Save Profile' : 'Next Step'}
                </button>
            </div>
        </div>
    );
}

export default ProfileSetup;
