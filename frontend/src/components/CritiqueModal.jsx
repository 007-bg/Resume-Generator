import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Lightbulb, FileText, TrendingUp, Target } from 'lucide-react';
import { getCandidate } from '../api/client';

function CritiqueModal({ candidateId, candidateName, onClose }) {
    const [critique, setCritique] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCritique();
    }, [candidateId]);

    const loadCritique = async () => {
        try {
            setIsLoading(true);
            const data = await getCandidate(candidateId);
            setCritique(data.critique);
        } catch (err) {
            console.error('Failed to load critique:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreClass = (score) => {
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        if (score >= 40) return 'score-average';
        return 'score-poor';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent Match';
        if (score >= 60) return 'Good Match';
        if (score >= 40) return 'Partial Match';
        return 'Low Match';
    };

    if (isLoading) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Loading Analysis...</h2>
                        <button className="btn btn-ghost btn-icon" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="skeleton" style={{ height: 100, marginBottom: 16 }} />
                        <div className="skeleton" style={{ height: 150, marginBottom: 16 }} />
                        <div className="skeleton" style={{ height: 150 }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!critique || !critique.result_json) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Analysis Error</h2>
                        <button className="btn btn-ghost btn-icon" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="modal-body text-center">
                        <AlertTriangle size={48} style={{ color: 'var(--error)', marginBottom: 16 }} />
                        <p>Failed to load critique results</p>
                        {critique?.error_message && (
                            <p className="text-muted mt-sm">{critique.error_message}</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

    const { scores, strengths, weaknesses, recommendations, formatting_notes } = critique.result_json;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 800 }}
            >
                <div className="modal-header">
                    <div>
                        <h2>Resume Analysis</h2>
                        <p className="text-secondary">{candidateName}</p>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Score Overview */}
                    <div
                        className="card mb-lg"
                        style={{
                            background: 'var(--bg-tertiary)',
                            border: 'none',
                            textAlign: 'center',
                            padding: 'var(--space-xl)'
                        }}
                    >
                        <div
                            className={`score-badge ${getScoreClass(scores.overall_score)}`}
                            style={{
                                fontSize: 'var(--font-size-3xl)',
                                fontWeight: 700,
                                padding: '16px 32px',
                                marginBottom: 8
                            }}
                        >
                            {Math.round(scores.overall_score)}%
                        </div>
                        <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 500 }}>
                            {getScoreLabel(scores.overall_score)}
                        </p>

                        <div className="grid-3 mt-lg" style={{ textAlign: 'left', gap: 'var(--space-md)' }}>
                            <div>
                                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginBottom: 4 }}>
                                    Semantic Match
                                </p>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${scores.semantic_score}%` }}
                                    />
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
                                    {Math.round(scores.semantic_score)}%
                                </p>
                            </div>

                            <div>
                                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginBottom: 4 }}>
                                    Keyword Match
                                </p>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${scores.keyword_score}%` }}
                                    />
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
                                    {Math.round(scores.keyword_score)}%
                                </p>
                            </div>

                            <div>
                                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginBottom: 4 }}>
                                    Keywords Found
                                </p>
                                <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                                    {scores.matched_keywords?.length || 0} / {(scores.matched_keywords?.length || 0) + (scores.missing_keywords?.length || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Strengths */}
                    {strengths?.length > 0 && (
                        <div className="mb-lg">
                            <h3 className="flex items-center gap-sm mb-md" style={{ color: 'var(--success)' }}>
                                <CheckCircle size={20} />
                                Strengths
                            </h3>
                            <ul style={{ listStyle: 'none' }}>
                                {strengths.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-sm mb-sm"
                                        style={{
                                            padding: 'var(--space-sm) var(--space-md)',
                                            background: 'var(--success-bg)',
                                            borderRadius: 'var(--border-radius-sm)',
                                            fontSize: 'var(--font-size-sm)'
                                        }}
                                    >
                                        <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Weaknesses */}
                    {weaknesses?.length > 0 && (
                        <div className="mb-lg">
                            <h3 className="flex items-center gap-sm mb-md" style={{ color: 'var(--warning)' }}>
                                <AlertTriangle size={20} />
                                Areas for Improvement
                            </h3>
                            <ul style={{ listStyle: 'none' }}>
                                {weaknesses.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-sm mb-sm"
                                        style={{
                                            padding: 'var(--space-sm) var(--space-md)',
                                            background: 'var(--warning-bg)',
                                            borderRadius: 'var(--border-radius-sm)',
                                            fontSize: 'var(--font-size-sm)'
                                        }}
                                    >
                                        <AlertTriangle size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {recommendations?.length > 0 && (
                        <div className="mb-lg">
                            <h3 className="flex items-center gap-sm mb-md" style={{ color: 'var(--info)' }}>
                                <Lightbulb size={20} />
                                Recommendations
                            </h3>
                            <ul style={{ listStyle: 'none' }}>
                                {recommendations.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-sm mb-sm"
                                        style={{
                                            padding: 'var(--space-sm) var(--space-md)',
                                            background: 'var(--info-bg)',
                                            borderRadius: 'var(--border-radius-sm)',
                                            fontSize: 'var(--font-size-sm)'
                                        }}
                                    >
                                        <Lightbulb size={14} style={{ color: 'var(--info)', flexShrink: 0 }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Keywords Section */}
                    <div className="grid-2" style={{ gap: 'var(--space-md)' }}>
                        {scores.matched_keywords?.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-sm mb-sm text-secondary">
                                    <Target size={16} />
                                    Matched Keywords
                                </h4>
                                <div className="flex" style={{ flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                                    {scores.matched_keywords.slice(0, 15).map((kw, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                padding: '2px 8px',
                                                background: 'var(--success-bg)',
                                                color: 'var(--success)',
                                                borderRadius: 'var(--border-radius-sm)',
                                                fontSize: 'var(--font-size-xs)'
                                            }}
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {scores.missing_keywords?.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-sm mb-sm text-secondary">
                                    <TrendingUp size={16} />
                                    Missing Keywords
                                </h4>
                                <div className="flex" style={{ flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                                    {scores.missing_keywords.slice(0, 15).map((kw, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                padding: '2px 8px',
                                                background: 'var(--error-bg)',
                                                color: 'var(--error)',
                                                borderRadius: 'var(--border-radius-sm)',
                                                fontSize: 'var(--font-size-xs)'
                                            }}
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Formatting Notes */}
                    {formatting_notes?.length > 0 && (
                        <div className="mt-lg">
                            <h4 className="flex items-center gap-sm mb-sm text-secondary">
                                <FileText size={16} />
                                Formatting Notes
                            </h4>
                            <ul style={{ listStyle: 'none' }}>
                                {formatting_notes.map((note, i) => (
                                    <li key={i} className="text-muted mb-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                                        • {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CritiqueModal;
