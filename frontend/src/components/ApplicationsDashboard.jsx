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
    SAVED: { label: 'Saved', color: 'text-muted-foreground', bg: 'bg-muted' },
    APPLIED: { label: 'Applied', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    SCREENING: { label: 'Screening', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    INTERVIEWING: { label: 'Interviewing', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    TECHNICAL: { label: 'Technical', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    FINAL: { label: 'Final Round', color: 'text-pink-400', bg: 'bg-pink-400/10' },
    OFFER: { label: 'Offer', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    ACCEPTED: { label: 'Accepted', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    REJECTED: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10' },
    WITHDRAWN: { label: 'Withdrawn', color: 'text-gray-400', bg: 'bg-gray-400/10' }
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
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
                    <p className="text-muted-foreground mt-2">Track your job applications and their progress</p>
                </div>
                <button className="btn btn-primary gap-2" onClick={() => setShowAddModal(true)}>
                    <Icon icon="mdi:plus" width="18" />
                    Add Application
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="card p-6 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold mb-1">{stats.total}</div>
                        <div className="text-muted-foreground text-sm">Total Applications</div>
                    </div>
                    <div className="card p-6 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold mb-1 text-primary">{stats.active}</div>
                        <div className="text-muted-foreground text-sm">Active</div>
                    </div>
                    <div className="card p-6 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold mb-1 text-emerald-500">{stats.by_status?.OFFER || 0}</div>
                        <div className="text-muted-foreground text-sm">Offers</div>
                    </div>
                    <div className="card p-6 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold mb-1 text-yellow-500">{stats.by_status?.INTERVIEWING || 0}</div>
                        <div className="text-muted-foreground text-sm">Interviewing</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Icon icon="mdi:filter-variant" width="20" className="text-muted-foreground" />
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={statusFilter}
                        onChange={e => dispatch(setStatusFilter(e.target.value))}
                    >
                        <option value="all">All Statuses</option>
                        {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center bg-secondary rounded-lg p-1">
                    <button
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => dispatch(setViewMode('list'))}
                    >
                        List
                    </button>
                    <button
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'kanban' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => dispatch(setViewMode('kanban'))}
                    >
                        Kanban
                    </button>
                </div>
            </div>

            {/* Applications List */}
            {isLoading ? (
                <div className="space-y-4">
                    <div className="skeleton h-24 w-full bg-muted/20 rounded-xl animate-pulse" />
                    <div className="skeleton h-24 w-full bg-muted/20 rounded-xl animate-pulse" />
                    <div className="skeleton h-24 w-full bg-muted/20 rounded-xl animate-pulse" />
                </div>
            ) : viewMode === 'list' ? (
                <div className="card p-0 overflow-hidden">
                    {applications.length === 0 ? (
                        <div className="text-center py-20">
                            <Icon icon="mdi:briefcase-outline" width="48" className="mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                            <p className="text-muted-foreground mb-6">Start tracking your job applications</p>
                            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                <Icon icon="mdi:plus" width="18" className="mr-2" /> Add Application
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
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
        <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group">
            <button
                className="p-1 text-muted-foreground hover:text-yellow-400 transition-colors bg-transparent border-none cursor-pointer"
                onClick={() => onToggleFavorite(app.id)}
            >
                <Icon icon={app.is_favorite ? "mdi:star" : "mdi:star-outline"} width="20" className={app.is_favorite ? "text-yellow-400" : ""} />
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{app.position}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                    </span>
                    {app.url && (
                        <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <Icon icon="mdi:open-in-new" width="14" />
                        </a>
                    )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Icon icon="mdi:domain" width="14" /> {app.company_name}
                    </span>
                    <span className="flex items-center gap-1">
                        <Icon icon="mdi:map-marker" width="14" /> {app.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1">
                        <Icon icon="mdi:calendar" width="14" /> {new Date(app.applied_date).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <select
                    className="h-8 rounded md:w-32 text-xs border-input bg-background"
                    value={app.status}
                    onChange={(e) => onStatusUpdate(app.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                >
                    {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <button className="btn btn-secondary h-8 w-8 p-0" onClick={onEdit}>
                    <Icon icon="mdi:pencil" width="14" />
                </button>
                <button className="btn h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => onDelete(app.id)}>
                    <Icon icon="mdi:delete" width="14" />
                </button>
            </div>
        </div>
    );
}

function KanbanView({ applications, onStatusUpdate }) {
    const columns = STATUS_ORDER;

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(status => {
                const statusApps = applications.filter(app => app.status === status);
                const config = STATUS_CONFIG[status];

                return (
                    <div key={status} className="min-w-[300px] w-[300px] flex-shrink-0 bg-secondary/30 rounded-xl p-4 border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${config.bg.replace('/10', '')}`} />
                                {config.label}
                            </h3>
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                {statusApps.length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {statusApps.map(app => (
                                <div key={app.id} className="card p-3 bg-card hover:border-primary/50 cursor-grab active:cursor-grabbing">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-sm">{app.position}</h4>
                                        {app.is_favorite && <Icon icon="mdi:star" className="text-yellow-400" width="14" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{app.company_name}</p>
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                        <span>{new Date(app.applied_date).toLocaleDateString()}</span>
                                        <div className="flex gap-1">
                                            {/* Quick Actions if needed */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {statusApps.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                                    <p className="text-xs text-muted-foreground">No applications</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ApplicationModal({ application, onClose, onSave }) {
    const [formData, setFormData] = useState({
        company_name: '',
        position: '',
        location: '',
        status: 'APPLIED',
        applied_date: new Date().toISOString().split('T')[0],
        url: '',
        notes: '',
        salary_range: ''
    });

    useEffect(() => {
        if (application) {
            setFormData({
                ...application,
                applied_date: application.applied_date ? new Date(application.applied_date).toISOString().split('T')[0] : ''
            });
        }
    }, [application]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, !!application);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{application ? 'Edit Application' : 'Add Application'}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <Icon icon="mdi:close" width="20" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Company</label>
                            <input
                                type="text"
                                name="company_name"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.company_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Position</label>
                            <input
                                type="text"
                                name="position"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.position}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Status</label>
                            <select
                                name="status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Date Applied</label>
                            <input
                                type="date"
                                name="applied_date"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.applied_date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Job URL</label>
                        <input
                            type="url"
                            name="url"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formData.url || ''}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Location</label>
                        <input
                            type="text"
                            name="location"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formData.location || ''}
                            onChange={handleChange}
                            placeholder="e.g. Remote, New York"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {application ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ApplicationsDashboard;
