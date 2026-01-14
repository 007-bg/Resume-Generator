import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Briefcase, Star, StarOff, ExternalLink, Trash2,
    Calendar, Clock, Building2, MapPin, Filter
} from 'lucide-react';
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
import { useState } from 'react';

const STATUS_CONFIG = {
    SAVED: { label: 'Saved', color: '#6b7280', bg: '#374151' },
    APPLIED: { label: 'Applied', color: '#3b82f6', bg: '#1e3a5f' },
    SCREENING: { label: 'Screening', color: '#8b5cf6', bg: '#4c1d95' },
    INTERVIEWING: { label: 'Interviewing', color: '#f59e0b', bg: '#78350f' },
    TECHNICAL: { label: 'Technical', color: '#ec4899', bg: '#831843' },
    FINAL: { label: 'Final Round', color: '#14b8a6', bg: '#134e4a' },
    OFFER: { label: 'Offer', color: '#22c55e', bg: '#14532d' },
    ACCEPTED: { label: 'Accepted', color: '#10b981', bg: '#064e3b' },
    REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#7f1d1d' },
    WITHDRAWN: { label: 'Withdrawn', color: '#6b7280', bg: '#1f2937' }
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
            <div className="flex items-center justify-between mb-lg">
                <div>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                        Job Applications
                    </h1>
                    <p className="text-secondary mt-sm">
                        Track your job applications and their progress
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} />
                    Add Application
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid-4 mb-lg">
                    <div className="card stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Applications</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.active}</div>
                        <div className="stat-label">Active</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.by_status?.OFFER || 0}</div>
                        <div className="stat-label">Offers</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.by_status?.INTERVIEWING || 0}</div>
                        <div className="stat-label">Interviewing</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-md mb-lg">
                <div className="flex items-center gap-sm">
                    <Filter size={16} className="text-muted" />
                    <select
                        className="form-input"
                        style={{ width: 'auto' }}
                        value={statusFilter}
                        onChange={e => dispatch(setStatusFilter(e.target.value))}
                    >
                        <option value="all">All Statuses</option>
                        {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-sm">
                    <button
                        className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => dispatch(setViewMode('list'))}
                    >
                        List
                    </button>
                    <button
                        className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => dispatch(setViewMode('kanban'))}
                    >
                        Kanban
                    </button>
                </div>
            </div>

            {/* Applications List */}
            {isLoading ? (
                <div className="card">
                    <div className="skeleton" style={{ height: 60, marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 60, marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 60 }} />
                </div>
            ) : viewMode === 'list' ? (
                <div className="card">
                    {applications.length === 0 ? (
                        <div className="empty-state">
                            <Briefcase size={48} className="empty-state-icon" />
                            <h3>No applications yet</h3>
                            <p className="text-muted mb-md">Start tracking your job applications</p>
                            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                <Plus size={18} /> Add Application
                            </button>
                        </div>
                    ) : (
                        <div className="applications-list">
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
        <div className="application-row">
            <button className="favorite-btn" onClick={() => onToggleFavorite(app.id)}>
                {app.is_favorite ? <Star size={18} fill="var(--warning)" color="var(--warning)" /> : <StarOff size={18} />}
            </button>

            <div className="application-info" onClick={onEdit} style={{ cursor: 'pointer' }}>
                <div className="application-title">
                    <h4>{app.job_title}</h4>
                    {app.job_url && (
                        <a href={app.job_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                            <ExternalLink size={14} />
                        </a>
                    )}
                </div>
                <div className="application-meta">
                    <span><Building2 size={14} /> {app.company}</span>
                    {app.location && <span><MapPin size={14} /> {app.location}</span>}
                    {app.applied_date && <span><Calendar size={14} /> Applied {app.applied_date}</span>}
                    {app.days_since_applied !== null && (
                        <span><Clock size={14} /> {app.days_since_applied} days ago</span>
                    )}
                </div>
                {app.resume_title && (
                    <div className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                        Resume: {app.resume_title}
                    </div>
                )}
            </div>

            <div className="application-status">
                <select
                    className="status-select"
                    value={app.status}
                    onChange={e => onStatusUpdate(app.id, e.target.value)}
                    style={{ background: statusConfig.bg, color: statusConfig.color, borderColor: statusConfig.color }}
                >
                    {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            <button className="btn btn-ghost btn-icon" onClick={() => onDelete(app.id)}>
                <Trash2 size={16} />
            </button>
        </div>
    );
}

function KanbanView({ applications, onStatusUpdate }) {
    const allApps = useSelector(state => state.applications.items);

    return (
        <div className="kanban-board">
            {STATUS_ORDER.map(status => {
                const config = STATUS_CONFIG[status];
                const apps = allApps.filter(a => a.status === status);

                return (
                    <div key={status} className="kanban-column">
                        <div className="kanban-header" style={{ borderColor: config.color }}>
                            <span>{config.label}</span>
                            <span className="kanban-count">{apps.length}</span>
                        </div>
                        <div className="kanban-cards">
                            {apps.map(app => (
                                <div key={app.id} className="kanban-card">
                                    <h4>{app.job_title}</h4>
                                    <p className="text-muted">{app.company}</p>
                                    {app.applied_date && (
                                        <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                                            {app.applied_date}
                                        </p>
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Application' : 'Add Application'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Job Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.job_title}
                                    onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
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

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Job URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={formData.job_url}
                                    onChange={e => setFormData({ ...formData, job_url: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid-3">
                            <div className="form-group">
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
                            <div className="form-group">
                                <label className="form-label">Applied Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.applied_date || ''}
                                    onChange={e => setFormData({ ...formData, applied_date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
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

                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-textarea"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
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
