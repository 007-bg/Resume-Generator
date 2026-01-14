import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchApplications,
    fetchApplicationStats,
    updateApplicationStatus,
    deleteApplication,
    toggleFavorite,
    createApplication,
    updateApplication,
    setStatusFilter,
    setViewMode,
    selectFilteredApplications,
    selectApplicationStats,
    selectApplicationsLoading,
    selectStatusFilter,
    selectViewMode,
} from '../store/slices/applicationsSlice';

const STATUS_CONFIG = {
    SAVED: { label: 'Saved', color: '#A8D0E6', bg: '#374785' },
    APPLIED: { label: 'Applied', color: '#F8E9A1', bg: '#24305E' },
    SCREENING: { label: 'Screening', color: '#A8D0E6', bg: '#374785' },
    INTERVIEWING: { label: 'Interviewing', color: '#F8E9A1', bg: '#24305E' },
    TECHNICAL: { label: 'Technical', color: '#F76C6C', bg: '#374785' },
    FINAL: { label: 'Final Round', color: '#A8D0E6', bg: '#24305E' },
    OFFER: { label: 'Offer', color: '#22c55e', bg: '#14532d' },
    ACCEPTED: { label: 'Accepted', color: '#10b981', bg: '#064e3b' },
    REJECTED: { label: 'Rejected', color: '#F76C6C', bg: '#24305E' },
    WITHDRAWN: { label: 'Withdrawn', color: '#A8D0E6', bg: '#374785' }
};

const STATUS_ORDER = ['SAVED', 'APPLIED', 'SCREENING', 'INTERVIEWING', 'TECHNICAL', 'FINAL', 'OFFER'];

function ApplicationsDashboard() {
    const dispatch = useDispatch();
    const applications = useSelector(selectFilteredApplications);
    const stats = useSelector(selectApplicationStats);
    const isLoading = useSelector(selectApplicationsLoading);
    const statusFilter = useSelector(selectStatusFilter);
    const viewMode = useSelector(selectViewMode);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingApp, setEditingApp] = useState(null);

    useEffect(() => {
        dispatch(fetchApplications());
        dispatch(fetchApplicationStats());
    }, [dispatch]);

    const handleStatusUpdate = (appId, newStatus) => {
        dispatch(updateApplicationStatus({ id: appId, status: newStatus }));
    };

    const handleToggleFavorite = (appId) => {
        dispatch(toggleFavorite(appId));
    };

    const handleDelete = async (appId) => {
        if (!confirm('Delete this application?')) return;
        dispatch(deleteApplication(appId));
    };

    const handleSave = async (formData, isEditing) => {
        if (isEditing) {
            await dispatch(updateApplication({ id: editingApp.id, data: formData }));
        } else {
            await dispatch(createApplication(formData));
        }
        setShowAddModal(false);
        setEditingApp(null);
        dispatch(fetchApplicationStats());
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Job Applications</h1>
                    <p className="text-sky/70 mt-2">Track your job applications and their progress</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <FiPlus size={18} />
                    Add Application
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="card text-center p-6">
                        <div className="text-3xl font-bold mb-1">{stats.total}</div>
                        <div className="text-sky/60 text-sm">Total Applications</div>
                    </div>
                    <div className="card text-center p-6">
                        <div className="text-3xl font-bold mb-1 text-sky">{stats.active}</div>
                        <div className="text-sky/60 text-sm">Active</div>
                    </div>
                    <div className="card text-center p-6">
                        <div className="text-3xl font-bold mb-1 text-emerald-500">{stats.by_status?.OFFER || 0}</div>
                        <div className="text-sky/60 text-sm">Offers</div>
                    </div>
                    <div className="card text-center p-6">
                        <div className="text-3xl font-bold mb-1 text-cream">{stats.by_status?.INTERVIEWING || 0}</div>
                        <div className="text-sky/60 text-sm">Interviewing</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <FiFilter size={16} className="text-sky/50" />
                    <select
                        className="form-input w-auto"
                        value={statusFilter}
                        onChange={e => dispatch(setStatusFilter(e.target.value))}
                    >
                        <option value="all">All Statuses</option>
                        {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className={`btn px-3 py-1.5 text-xs ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => dispatch(setViewMode('list'))}
                    >
                        List
                    </button>
                    <button
                        className={`btn px-3 py-1.5 text-xs ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => dispatch(setViewMode('kanban'))}
                    >
                        Kanban
                    </button>
                </div>
            </div>

            {/* Applications List */}
            {isLoading ? (
                <div className="card">
                    <div className="skeleton h-16 mb-3" />
                    <div className="skeleton h-16 mb-3" />
                    <div className="skeleton h-16" />
                </div>
            ) : viewMode === 'list' ? (
                <div className="card p-0">
                    {applications.length === 0 ? (
                        <div className="text-center py-12 text-sky/50">
                            <FiBriefcase size={48} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold text-sky/70 mb-2">No applications yet</h3>
                            <p className="text-sky/50 mb-4">Start tracking your job applications</p>
                            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                <FiPlus size={18} /> Add Application
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-sky/10">
                            {applications.map(app => (
                                <ApplicationRow
                                    key={app.id}
                                    app={app}
                                    onStatusUpdate={handleStatusUpdate}
                                    onToggleFavorite={handleToggleFavorite}
                                    onDelete={handleDelete}
                                    onEdit={() => setEditingApp(app)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <KanbanView
                    applications={applications}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}

            {(showAddModal || editingApp) && (
                <ApplicationModal
                    application={editingApp}
                    onClose={() => { setShowAddModal(false); setEditingApp(null); }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

function ApplicationRow({ app, onStatusUpdate, onToggleFavorite, onDelete, onEdit }) {
    const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.SAVED;

    return (
        <div className="flex items-center gap-4 p-4 hover:bg-sky/5 transition-colors">
            <button
                className="p-1 text-sky/50 hover:text-cream transition-colors bg-transparent border-none cursor-pointer"
                onClick={() => onToggleFavorite(app.id)}
            >
                <FiStar size={18} fill={app.is_favorite ? "#F8E9A1" : "none"} color={app.is_favorite ? "#F8E9A1" : "currentColor"} />
            </button>

            <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{app.job_title}</h4>
                    {app.job_url && (
                        <a
                            href={app.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-sky/50 hover:text-coral"
                        >
                            <FiExternalLink size={14} />
                        </a>
                    )}
                </div>
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-sky/60">
                    <span className="flex items-center gap-1"><FiHome size={14} /> {app.company}</span>
                    {app.location && <span className="flex items-center gap-1"><FiMapPin size={14} /> {app.location}</span>}
                    {app.applied_date && <span className="flex items-center gap-1"><FiCalendar size={14} /> Applied {app.applied_date}</span>}
                    {app.days_since_applied !== null && (
                        <span className="flex items-center gap-1"><FiClock size={14} /> {app.days_since_applied} days ago</span>
                    )}
                </div>
                {app.resume_title && (
                    <div className="text-sky/50 text-xs mt-1">Resume: {app.resume_title}</div>
                )}
            </div>

            <div className="flex-shrink-0">
                <select
                    className="px-3 py-1.5 text-xs font-medium rounded-sm cursor-pointer border"
                    value={app.status}
                    onChange={e => onStatusUpdate(app.id, e.target.value)}
                    style={{ background: statusConfig.bg, color: statusConfig.color, borderColor: statusConfig.color }}
                >
                    {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            <button className="btn btn-ghost p-2" onClick={() => onDelete(app.id)}>
                <FiTrash2 size={16} />
            </button>
        </div>
    );
}

function KanbanView({ applications, onStatusUpdate }) {
    const allApps = useSelector(state => state.applications.items);

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_ORDER.map(status => {
                const config = STATUS_CONFIG[status];
                const apps = allApps.filter(a => a.status === status);

                return (
                    <div key={status} className="flex-shrink-0 w-72 bg-dark-card border border-sky/20 rounded flex flex-col max-h-[70vh]">
                        <div
                            className="p-4 border-b-2 flex items-center justify-between font-semibold"
                            style={{ borderColor: config.color }}
                        >
                            <span>{config.label}</span>
                            <span className="bg-navy px-2 py-0.5 rounded-full text-xs">{apps.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {apps.map(app => (
                                <div
                                    key={app.id}
                                    className="bg-navy border border-sky/20 rounded-sm p-3 cursor-pointer hover:border-coral hover:-translate-y-0.5 transition-all"
                                >
                                    <h4 className="text-sm font-medium mb-1">{app.job_title}</h4>
                                    <p className="text-sky/60 text-xs">{app.company}</p>
                                    {app.applied_date && (
                                        <p className="text-sky/50 text-xs mt-1">{app.applied_date}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ApplicationModal({ application, onClose, onSave }) {
    const isEditing = !!application;
    const [formData, setFormData] = useState(application || {
        job_title: '',
        company: '',
        job_url: '',
        location: '',
        salary_range: '',
        job_type: '',
        status: 'SAVED',
        applied_date: '',
        notes: '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(formData, isEditing);
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
            <div className="bg-navy-dark border border-sky/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-sky/10">
                    <h2 className="text-xl font-bold">{isEditing ? 'Edit Application' : 'Add Application'}</h2>
                    <button className="btn btn-ghost p-2" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Job Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.job_title}
                                    onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Company *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Job URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={formData.job_url}
                                    onChange={e => setFormData({ ...formData, job_url: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="form-label">Status</label>
                                <select
                                    className="form-input"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Applied Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.applied_date || ''}
                                    onChange={e => setFormData({ ...formData, applied_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="form-label">Salary Range</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.salary_range}
                                    onChange={e => setFormData({ ...formData, salary_range: e.target.value })}
                                    placeholder="$100k - $150k"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-textarea"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-6 border-t border-sky/10">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <span className="spinner" /> : (isEditing ? 'Save Changes' : 'Add Application')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ApplicationsDashboard;
