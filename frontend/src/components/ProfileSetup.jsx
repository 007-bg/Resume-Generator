import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiBriefcase, FiBook, FiCode, FiAward, FiSave, FiArrowRight, FiPlus, FiTrash2 } from 'react-icons/fi';
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

    useEffect(() => {
        if (groundTruth && Object.keys(groundTruth).length > 0) {
            setLocalData({ ...localData, ...groundTruth });
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
        { icon: FiUser, label: 'Personal Info' },
        { icon: FiBriefcase, label: 'Experience' },
        { icon: FiBook, label: 'Education' },
        { icon: FiCode, label: 'Skills' },
        { icon: FiAward, label: 'Certifications' }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-sky/50">
                <div className="spinner w-10 h-10" />
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-sky/70 mb-6">
                This information will be used to generate your personalized resumes.
            </p>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {steps.map((s, i) => (
                    <div key={i} className="flex items-center">
                        <button
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step === i + 1
                                    ? 'bg-coral text-white'
                                    : 'bg-navy text-sky border border-sky/20 hover:border-coral'
                                }`}
                            onClick={() => setStep(i + 1)}
                        >
                            <s.icon size={18} />
                        </button>
                        {i < steps.length - 1 && (
                            <div className="w-10 h-0.5 bg-sky/20" />
                        )}
                    </div>
                ))}
            </div>

            <div className="card">
                {/* Step 1: Personal Info */}
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={localData.personal_info.full_name || ''}
                                    onChange={e => updateField('personal_info', 'full_name', e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={localData.personal_info.email || user?.email || ''}
                                    onChange={e => updateField('personal_info', 'email', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={localData.personal_info.phone || ''}
                                    onChange={e => updateField('personal_info', 'phone', e.target.value)}
                                    placeholder="+1-555-0123"
                                />
                            </div>
                            <div>
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={localData.personal_info.location || ''}
                                    onChange={e => updateField('personal_info', 'location', e.target.value)}
                                    placeholder="San Francisco, CA"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="form-label">LinkedIn URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={localData.personal_info.linkedin || ''}
                                    onChange={e => updateField('personal_info', 'linkedin', e.target.value)}
                                    placeholder="linkedin.com/in/johndoe"
                                />
                            </div>
                            <div>
                                <label className="form-label">GitHub URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={localData.personal_info.github || ''}
                                    onChange={e => updateField('personal_info', 'github', e.target.value)}
                                    placeholder="github.com/johndoe"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="form-label">Professional Summary</label>
                            <textarea
                                className="form-textarea"
                                value={localData.summary || ''}
                                onChange={e => updateField('summary', null, e.target.value)}
                                placeholder="Brief overview of your professional background..."
                                rows={4}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Experience */}
                {step === 2 && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Work Experience</h2>
                            <button className="btn btn-secondary" onClick={() => addItem('experience')}>
                                <FiPlus size={16} /> Add Experience
                            </button>
                        </div>

                        {(localData.experience || []).map((exp, i) => (
                            <div key={i} className="bg-navy border border-sky/20 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium">Experience {i + 1}</h4>
                                    <button className="btn btn-ghost p-2" onClick={() => removeItem('experience', i)}>
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Job Title</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={exp.title || ''}
                                            onChange={e => updateItem('experience', i, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Company</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={exp.company || ''}
                                            onChange={e => updateItem('experience', i, 'company', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="month"
                                            className="form-input"
                                            value={exp.start_date || ''}
                                            onChange={e => updateItem('experience', i, 'start_date', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">End Date (leave empty if current)</label>
                                        <input
                                            type="month"
                                            className="form-input"
                                            value={exp.end_date || ''}
                                            onChange={e => updateItem('experience', i, 'end_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="form-label">Description & Achievements</label>
                                    <textarea
                                        className="form-textarea"
                                        value={exp.description || ''}
                                        onChange={e => updateItem('experience', i, 'description', e.target.value)}
                                        placeholder="Key responsibilities and achievements..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ))}

                        {(localData.experience || []).length === 0 && (
                            <div className="text-center py-8 text-sky/50">
                                <p>No experience added yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Education */}
                {step === 3 && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Education</h2>
                            <button className="btn btn-secondary" onClick={() => addItem('education')}>
                                <FiPlus size={16} /> Add Education
                            </button>
                        </div>

                        {(localData.education || []).map((edu, i) => (
                            <div key={i} className="bg-navy border border-sky/20 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium">Education {i + 1}</h4>
                                    <button className="btn btn-ghost p-2" onClick={() => removeItem('education', i)}>
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Degree</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.degree || ''}
                                            onChange={e => updateItem('education', i, 'degree', e.target.value)}
                                            placeholder="B.S. Computer Science"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Institution</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.institution || ''}
                                            onChange={e => updateItem('education', i, 'institution', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="form-label">Graduation Date</label>
                                        <input
                                            type="month"
                                            className="form-input"
                                            value={edu.graduation_date || ''}
                                            onChange={e => updateItem('education', i, 'graduation_date', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">GPA (optional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.gpa || ''}
                                            onChange={e => updateItem('education', i, 'gpa', e.target.value)}
                                            placeholder="3.8"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Step 4: Skills */}
                {step === 4 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-6">Skills</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Technical Skills</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={(localData.skills?.technical || []).join(', ')}
                                    onChange={e => updateField('skills', 'technical', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder="Python, JavaScript, React, AWS (comma-separated)"
                                />
                            </div>
                            <div>
                                <label className="form-label">Soft Skills</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={(localData.skills?.soft || []).join(', ')}
                                    onChange={e => updateField('skills', 'soft', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder="Leadership, Communication, Problem Solving"
                                />
                            </div>
                            <div>
                                <label className="form-label">Languages</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={(localData.skills?.languages || []).join(', ')}
                                    onChange={e => updateField('skills', 'languages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder="English (Native), Spanish (Intermediate)"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Certifications */}
                {step === 5 && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Certifications (Optional)</h2>
                            <button className="btn btn-secondary" onClick={() => addItem('certifications')}>
                                <FiPlus size={16} /> Add Certification
                            </button>
                        </div>

                        {(localData.certifications || []).map((cert, i) => (
                            <div key={i} className="bg-navy border border-sky/20 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium">Certification {i + 1}</h4>
                                    <button className="btn btn-ghost p-2" onClick={() => removeItem('certifications', i)}>
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Certification Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={cert.name || ''}
                                            onChange={e => updateItem('certifications', i, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Issuer</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={cert.issuer || ''}
                                            onChange={e => updateItem('certifications', i, 'issuer', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <button className="btn btn-secondary" onClick={() => setStep(step - 1)} disabled={step === 1}>
                        Back
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? <span className="spinner" /> : step < 5 ? <>Save & Continue <FiArrowRight size={18} /></> : <>Complete Setup <FiSave size={18} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileSetup;
