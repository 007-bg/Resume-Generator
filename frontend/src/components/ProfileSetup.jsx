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

    const [validationErrors, setValidationErrors] = useState({});

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
        // Clear error when user types
        if (validationErrors[section]) {
            setValidationErrors(prev => ({ ...prev, [section]: null }));
        }
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
        // Clear error when adding item
        if (validationErrors[section]) {
            setValidationErrors(prev => ({ ...prev, [section]: null }));
        }
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

    const validateStep = (currentStep) => {
        const errors = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!localData.personal_info?.full_name?.trim()) {
                errors.personal_info = "Full Name is required";
                isValid = false;
            }
            if (!localData.personal_info?.email?.trim()) {
                errors.personal_info = (errors.personal_info || "") + " Email is required";
                isValid = false;
            }
        }

        if (currentStep === 2) {
            if (!localData.experience || localData.experience.length === 0) {
                errors.experience = "At least one experience entry is required";
                isValid = false;
            } else {
                // Check if the entries are not empty
                const hasValidExp = localData.experience.some(exp => exp.title && exp.company);
                if (!hasValidExp) {
                    errors.experience = "Experience entries must have at least a Title and Company";
                    isValid = false;
                }
            }
        }

        if (currentStep === 3) {
            if (!localData.education || localData.education.length === 0) {
                errors.education = "At least one education entry is required";
                isValid = false;
            } else {
                const hasValidEdu = localData.education.some(edu => edu.degree && edu.institution);
                if (!hasValidEdu) {
                    errors.education = "Education entries must have Degree and Institution";
                    isValid = false;
                }
            }
        }

        if (currentStep === 4) {
            const techs = Array.isArray(localData.skills?.technical) ? localData.skills.technical : [];
            if (techs.length === 0) {
                errors.skills = "At least one technical skill is required";
                isValid = false;
            }
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 5));
            window.scrollTo(0, 0);
        }
    };

    const handleSave = async () => {
        // Validate all steps before final save
        let allValid = true;
        for (let i = 1; i <= 4; i++) {
            if (!validateStep(i)) {
                setStep(i); // Go to the first invalid step
                allValid = false;
                break;
            }
        }

        if (!allValid) return;

        const result = await dispatch(updateGroundTruth(localData));

        if (!result.error) {
            navigate('/dashboard');
        }
    };

    const steps = [
        { icon: "mdi:account", label: 'Personal Info' },
        { icon: "mdi:briefcase", label: 'Experience' },
        { icon: "mdi:school", label: 'Education' },
        { icon: "mdi:code-tags", label: 'Skills' },
        { icon: "mdi:checkbox-marked-circle-outline", label: 'Review' }
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
            <div className="relative mb-12 px-4">
                {/* Connecting Line - Positioned to align with circle centers (px-4 + w-10/2) */}
                <div className="absolute top-5 left-0 w-full px-9 -z-10">
                    <div className="relative h-0.5 w-full bg-secondary">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex justify-between">
                    {steps.map((s, i) => (
                        <div
                            key={i}
                            className={`flex flex-col items-center gap-3 transition-colors ${i + 1 === step ? 'text-primary' : i + 1 < step ? 'text-green-500' : 'text-muted-foreground'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background transition-all z-10 ${i + 1 === step ? 'border-primary shadow-glow scale-110' :
                                i + 1 < step ? 'border-green-500 bg-green-500/10' :
                                    'border-muted bg-muted'
                                }`}>
                                <Icon icon={i + 1 < step ? "mdi:check" : s.icon} width="20" />
                            </div>
                            <span className="text-xs font-medium hidden sm:block tracking-wide">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Card */}
            <div className="card p-6 md:p-8 animate-fade-in-up min-h-[400px]">
                {/* Step 1: Personal Info */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 pb-2 border-b border-border/50">
                            <Icon icon="mdi:account" className="text-primary" width="24" />
                            Personal Information
                        </h2>
                        {validationErrors.personal_info && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 flex items-center gap-2">
                                <Icon icon="mdi:alert-circle" width="16" />
                                {validationErrors.personal_info}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                                <input className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${validationErrors.personal_info?.includes('Name') ? 'border-destructive' : 'border-input'}`}
                                    value={localData.personal_info?.full_name || ''}
                                    onChange={e => updateField('personal_info', 'full_name', e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email *</label>
                                <input className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${validationErrors.personal_info?.includes('Email') ? 'border-destructive' : 'border-input'}`}
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

                {/* Step 2: Experience */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Icon icon="mdi:briefcase" className="text-primary" width="24" />
                                Work Experience
                            </h2>
                            <button className="btn btn-secondary text-xs gap-1" onClick={() => addItem('experience')}>
                                <Icon icon="mdi:plus" width="16" /> Add Experience
                            </button>
                        </div>

                        {validationErrors.experience && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 flex items-center gap-2">
                                <Icon icon="mdi:alert-circle" width="16" />
                                {validationErrors.experience}
                            </div>
                        )}

                        <div className="space-y-6">
                            {localData.experience?.map((exp, idx) => (
                                <div key={idx} className="p-6 rounded-lg border border-border bg-card/50 hover:bg-card hover:shadow-md transition-all relative group">
                                    <button className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 bg-background/80 p-1 rounded-sm backdrop-blur-sm" onClick={() => removeItem('experience', idx)}>
                                        <Icon icon="mdi:delete" width="18" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Job Title *</label>
                                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="e.g. Senior Developer"
                                                value={exp.title}
                                                onChange={e => updateItem('experience', idx, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Company *</label>
                                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="e.g. Tech Corp"
                                                value={exp.company}
                                                onChange={e => updateItem('experience', idx, 'company', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
                                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="YYYY-MM"
                                                value={exp.start_date}
                                                onChange={e => updateItem('experience', idx, 'start_date', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date</label>
                                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="YYYY-MM or Present"
                                                value={exp.end_date}
                                                onChange={e => updateItem('experience', idx, 'end_date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                                        <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            placeholder="Detailed description of your role, responsibilities, and achievements..."
                                            value={exp.description}
                                            onChange={e => updateItem('experience', idx, 'description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {localData.experience?.length === 0 && (
                            <button
                                onClick={() => addItem('experience')}
                                className="w-full py-12 text-center text-muted-foreground bg-secondary/10 rounded-lg border-2 border-dashed border-border hover:bg-secondary/20 hover:border-primary/50 transition-all flex flex-col items-center gap-2"
                            >
                                <Icon icon="mdi:briefcase-plus-outline" width="32" className="text-muted-foreground/50" />
                                <span>No experience added yet. Click to add your first role.</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Step 3: Education */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Icon icon="mdi:school" className="text-primary" width="24" />
                                Education
                            </h2>
                            <button className="btn btn-secondary text-xs gap-1" onClick={() => addItem('education')}>
                                <Icon icon="mdi:plus" width="16" /> Add Education
                            </button>
                        </div>

                        {validationErrors.education && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 flex items-center gap-2">
                                <Icon icon="mdi:alert-circle" width="16" />
                                {validationErrors.education}
                            </div>
                        )}

                        <div className="space-y-6">
                            {localData.education?.map((edu, idx) => (
                                <div key={idx} className="p-6 rounded-lg border border-border bg-card/50 hover:bg-card hover:shadow-md transition-all relative group">
                                    <button className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 bg-background/80 p-1 rounded-sm backdrop-blur-sm" onClick={() => removeItem('education', idx)}>
                                        <Icon icon="mdi:delete" width="18" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Degree *</label>
                                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="e.g. BS Computer Science"
                                                value={edu.degree}
                                                onChange={e => updateItem('education', idx, 'degree', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">School *</label>
                                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="e.g. University"
                                                value={edu.institution}
                                                onChange={e => updateItem('education', idx, 'institution', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Graduation Year</label>
                                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="YYYY"
                                                value={edu.graduation_date}
                                                onChange={e => updateItem('education', idx, 'graduation_date', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">GPA</label>
                                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="Optional"
                                                value={edu.gpa}
                                                onChange={e => updateItem('education', idx, 'gpa', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {localData.education?.length === 0 && (
                            <button
                                onClick={() => addItem('education')}
                                className="w-full py-12 text-center text-muted-foreground bg-secondary/10 rounded-lg border-2 border-dashed border-border hover:bg-secondary/20 hover:border-primary/50 transition-all flex flex-col items-center gap-2"
                            >
                                <Icon icon="mdi:school-outline" width="32" className="text-muted-foreground/50" />
                                <span>No education added yet. Click to add.</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Step 4: Skills */}
                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 pb-2 border-b border-border/50">
                            <Icon icon="mdi:code-tags" className="text-primary" width="24" />
                            Skills
                        </h2>

                        {validationErrors.skills && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 flex items-center gap-2">
                                <Icon icon="mdi:alert-circle" width="16" />
                                {validationErrors.skills}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1.5 ">Technical Skills * <span className="text-muted-foreground font-normal">(Comma separated)</span></label>
                            <textarea className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="e.g. React, Python, AWS, Docker, TypeScript..."
                                value={Array.isArray(localData.skills?.technical) ? localData.skills.technical.join(', ') : localData.skills?.technical || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    setLocalData(prev => ({
                                        ...prev,
                                        skills: { ...prev.skills, technical: val.split(',').map(s => s.trim()) }
                                    }));
                                    if (val.trim()) setValidationErrors(prev => ({ ...prev, skills: null }));
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Soft Skills <span className="text-muted-foreground font-normal">(Comma separated)</span></label>
                            <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="e.g. Leadership, Communication, Problem Solving..."
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
                        <h2 className="text-xl font-bold flex items-center gap-2 pb-2 border-b border-border/50">
                            <Icon icon="mdi:checkbox-marked-circle-outline" className="text-primary" width="24" />
                            Review & Complete
                        </h2>

                        <div className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="p-4 bg-secondary/30 border-b border-border">
                                <h3 className="font-bold text-foreground">Profile Summary</h3>
                            </div>
                            <div className="divide-y divide-border">
                                <div className="p-4 flex justify-between items-center bg-card hover:bg-secondary/10 transition-colors">
                                    <span className="text-muted-foreground text-sm font-medium">Full Name</span>
                                    <span className="font-semibold">{localData.personal_info?.full_name || '-'}</span>
                                </div>
                                <div className="p-4 flex justify-between items-center bg-card hover:bg-secondary/10 transition-colors">
                                    <span className="text-muted-foreground text-sm font-medium">Email</span>
                                    <span className="text-foreground">{localData.personal_info?.email || '-'}</span>
                                </div>
                                <div className="p-4 flex justify-between items-center bg-card hover:bg-secondary/10 transition-colors">
                                    <span className="text-muted-foreground text-sm font-medium">Experience Entries</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                        {localData.experience?.length || 0}
                                    </span>
                                </div>
                                <div className="p-4 flex justify-between items-center bg-card hover:bg-secondary/10 transition-colors">
                                    <span className="text-muted-foreground text-sm font-medium">Education Entries</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                        {localData.education?.length || 0}
                                    </span>
                                </div>
                                <div className="p-4 flex flex-col gap-2 bg-card hover:bg-secondary/10 transition-colors">
                                    <span className="text-muted-foreground text-sm font-medium">Technical Skills</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {localData.skills?.technical?.slice(0, 5).map((skill, i) => (
                                            <span key={i} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs">{skill}</span>
                                        ))}
                                        {(localData.skills?.technical?.length || 0) > 5 && (
                                            <span className="px-2 py-1 rounded-md bg-secondary/50 text-muted-foreground text-xs">+{localData.skills.technical.length - 5} more</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20 text-sm">
                            <Icon icon="mdi:information-outline" className="text-primary mt-0.5 shrink-0" width="18" />
                            <p className="text-muted-foreground">
                                By clicking <span className="font-semibold text-primary">Complete Setup</span>, you confirm that this information represents your master profile for resume generation.
                            </p>
                        </div>
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
                {step === 5 ? (
                    <button
                        className="btn btn-primary px-8 gap-2"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <div className="spinner w-4 h-4 border-white" /> : <Icon icon="mdi:content-save" width="18" />}
                        Complete Setup
                    </button>
                ) : (
                    <button
                        className="btn btn-primary px-8 gap-2"
                        onClick={handleNext}
                    >
                        Next Step
                        <Icon icon="mdi:arrow-right" width="18" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default ProfileSetup;
