import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, GraduationCap, Code, Award, Save, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function ProfileSetup() {
    const { api, user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);

    const [groundTruth, setGroundTruth] = useState(user?.profile?.ground_truth || {
        personal_info: {},
        summary: '',
        experience: [],
        education: [],
        skills: { technical: [], soft: [], languages: [] },
        certifications: [],
        projects: []
    });

    const updateField = (section, field, value) => {
        setGroundTruth(prev => ({
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

        setGroundTruth(prev => ({
            ...prev,
            [section]: [...(prev[section] || []), templates[section]]
        }));
    };

    const removeItem = (section, index) => {
        setGroundTruth(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const updateItem = (section, index, field, value) => {
        setGroundTruth(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/auth/profile/ground-truth/', groundTruth);
            if (step < 5) {
                setStep(step + 1);
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const steps = [
        { icon: User, label: 'Personal Info' },
        { icon: Briefcase, label: 'Experience' },
        { icon: GraduationCap, label: 'Education' },
        { icon: Code, label: 'Skills' },
        { icon: Award, label: 'Certifications' }
    ];

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                Complete Your Profile
            </h1>
            <p className="text-secondary mb-lg">
                This information will be used to generate your personalized resumes.
            </p>

            {/* Progress Steps */}
            <div className="flex items-center gap-sm mb-xl" style={{ justifyContent: 'center' }}>
                {steps.map((s, i) => (
                    <div key={i} className="flex items-center">
                        <button
                            className={`btn ${step === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setStep(i + 1)}
                            style={{ borderRadius: '50%', width: 40, height: 40, padding: 0 }}
                        >
                            <s.icon size={18} />
                        </button>
                        {i < steps.length - 1 && (
                            <div style={{ width: 40, height: 2, background: 'var(--border-color)' }} />
                        )}
                    </div>
                ))}
            </div>

            <div className="card">
                {/* Step 1: Personal Info */}
                {step === 1 && (
                    <div>
                        <h2 className="mb-lg">Personal Information</h2>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={groundTruth.personal_info.full_name || ''}
                                    onChange={e => updateField('personal_info', 'full_name', e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={groundTruth.personal_info.email || user?.email || ''}
                                    onChange={e => updateField('personal_info', 'email', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={groundTruth.personal_info.phone || ''}
                                    onChange={e => updateField('personal_info', 'phone', e.target.value)}
                                    placeholder="+1-555-0123"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={groundTruth.personal_info.location || ''}
                                    onChange={e => updateField('personal_info', 'location', e.target.value)}
                                    placeholder="San Francisco, CA"
                                />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">LinkedIn URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={groundTruth.personal_info.linkedin || ''}
                                    onChange={e => updateField('personal_info', 'linkedin', e.target.value)}
                                    placeholder="linkedin.com/in/johndoe"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">GitHub URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={groundTruth.personal_info.github || ''}
                                    onChange={e => updateField('personal_info', 'github', e.target.value)}
                                    placeholder="github.com/johndoe"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Professional Summary</label>
                            <textarea
                                className="form-textarea"
                                value={groundTruth.summary || ''}
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
                        <div className="flex items-center justify-between mb-lg">
                            <h2>Work Experience</h2>
                            <button className="btn btn-secondary" onClick={() => addItem('experience')}>
                                <Plus size={16} /> Add Experience
                            </button>
                        </div>

                        {(groundTruth.experience || []).map((exp, i) => (
                            <div key={i} className="card mb-md" style={{ background: 'var(--bg-tertiary)' }}>
                                <div className="flex items-center justify-between mb-md">
                                    <h4>Experience {i + 1}</h4>
                                    <button className="btn btn-ghost btn-icon" onClick={() => removeItem('experience', i)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Job Title</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={exp.title || ''}
                                            onChange={e => updateItem('experience', i, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Company</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={exp.company || ''}
                                            onChange={e => updateItem('experience', i, 'company', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="month"
                                            className="form-input"
                                            value={exp.start_date || ''}
                                            onChange={e => updateItem('experience', i, 'start_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Date (leave empty if current)</label>
                                        <input
                                            type="month"
                                            className="form-input"
                                            value={exp.end_date || ''}
                                            onChange={e => updateItem('experience', i, 'end_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
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

                        {(groundTruth.experience || []).length === 0 && (
                            <div className="empty-state">
                                <p className="text-muted">No experience added yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Education */}
                {step === 3 && (
                    <div>
                        <div className="flex items-center justify-between mb-lg">
                            <h2>Education</h2>
                            <button className="btn btn-secondary" onClick={() => addItem('education')}>
                                <Plus size={16} /> Add Education
                            </button>
                        </div>

                        {(groundTruth.education || []).map((edu, i) => (
                            <div key={i} className="card mb-md" style={{ background: 'var(--bg-tertiary)' }}>
                                <div className="flex items-center justify-between mb-md">
                                    <h4>Education {i + 1}</h4>
                                    <button className="btn btn-ghost btn-icon" onClick={() => removeItem('education', i)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Degree</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.degree || ''}
                                            onChange={e => updateItem('education', i, 'degree', e.target.value)}
                                            placeholder="B.S. Computer Science"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Institution</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.institution || ''}
                                            onChange={e => updateItem('education', i, 'institution', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Graduation Date</label>
                                        <input
                                            type="month"
                                            className="form-input"
                                            value={edu.graduation_date || ''}
                                            onChange={e => updateItem('education', i, 'graduation_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
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
                        <h2 className="mb-lg">Skills</h2>
                        <div className="form-group">
                            <label className="form-label">Technical Skills</label>
                            <input
                                type="text"
                                className="form-input"
                                value={(groundTruth.skills?.technical || []).join(', ')}
                                onChange={e => updateField('skills', 'technical', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="Python, JavaScript, React, AWS (comma-separated)"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Soft Skills</label>
                            <input
                                type="text"
                                className="form-input"
                                value={(groundTruth.skills?.soft || []).join(', ')}
                                onChange={e => updateField('skills', 'soft', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="Leadership, Communication, Problem Solving"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Languages</label>
                            <input
                                type="text"
                                className="form-input"
                                value={(groundTruth.skills?.languages || []).join(', ')}
                                onChange={e => updateField('skills', 'languages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="English (Native), Spanish (Intermediate)"
                            />
                        </div>
                    </div>
                )}

                {/* Step 5: Certifications */}
                {step === 5 && (
                    <div>
                        <div className="flex items-center justify-between mb-lg">
                            <h2>Certifications (Optional)</h2>
                            <button className="btn btn-secondary" onClick={() => addItem('certifications')}>
                                <Plus size={16} /> Add Certification
                            </button>
                        </div>

                        {(groundTruth.certifications || []).map((cert, i) => (
                            <div key={i} className="card mb-md" style={{ background: 'var(--bg-tertiary)' }}>
                                <div className="flex items-center justify-between mb-md">
                                    <h4>Certification {i + 1}</h4>
                                    <button className="btn btn-ghost btn-icon" onClick={() => removeItem('certifications', i)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Certification Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={cert.name || ''}
                                            onChange={e => updateItem('certifications', i, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
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
                <div className="flex items-center justify-between mt-xl">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1}
                    >
                        Back
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <span className="spinner" />
                        ) : step < 5 ? (
                            <>Save & Continue <ArrowRight size={18} /></>
                        ) : (
                            <>Complete Setup <Save size={18} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileSetup;
