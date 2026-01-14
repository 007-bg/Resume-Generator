import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
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
        if (score >= 80) return 'text-emerald-500 bg-emerald-500/10';
        if (score >= 60) return 'text-yellow-500 bg-yellow-500/10';
        if (score >= 40) return 'text-orange-500 bg-orange-500/10';
        return 'text-red-500 bg-red-500/10';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent Match';
        if (score >= 60) return 'Good Match';
        if (score >= 40) return 'Partial Match';
        return 'Low Match';
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
                <div className="bg-card border border-border rounded-lg max-w-xl w-full shadow-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Loading Analysis...</h2>
                        <button className="btn btn-ghost h-8 w-8 p-0" onClick={onClose}>
                            <Icon icon="mdi:close" width="18" />
                        </button>
                    </div>
                    <div className="h-24 bg-muted animate-pulse rounded-md" />
                    <div className="h-36 bg-muted animate-pulse rounded-md" />
                </div>
            </div>
        );
    }

    if (!critique || !critique.result_json) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
                <div className="bg-card border border-border rounded-lg max-w-xl w-full shadow-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <h2 className="text-xl font-bold">Analysis Error</h2>
                        <button className="btn btn-ghost h-8 w-8 p-0" onClick={onClose}>
                            <Icon icon="mdi:close" width="18" />
                        </button>
                    </div>
                    <div className="p-6 text-center">
                        <Icon icon="mdi:alert-circle" width="48" className="text-destructive mx-auto mb-4" />
                        <p className="text-foreground">Failed to load critique results</p>
                        {critique?.error_message && (
                            <p className="text-muted-foreground mt-2">{critique.error_message}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 p-6 border-t border-border">
                        <button className="btn btn-primary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

    const { scores, strengths, weaknesses, recommendations, formatting_notes } = critique.result_json;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
            <div
                className="bg-card border border-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                    <div>
                        <h2 className="text-xl font-bold">Resume Analysis</h2>
                        <p className="text-muted-foreground text-sm">{candidateName}</p>
                    </div>
                    <button className="btn btn-ghost h-8 w-8 p-0" onClick={onClose}>
                        <Icon icon="mdi:close" width="18" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Score Overview */}
                    <div className="bg-secondary/30 rounded-lg p-8 text-center border border-border">
                        <div className={`inline-flex items-center justify-center text-3xl font-bold px-8 py-4 mb-2 rounded-full ${getScoreClass(scores.overall_score)}`}>
                            {Math.round(scores.overall_score)}%
                        </div>
                        <p className="text-lg font-medium text-foreground">
                            {getScoreLabel(scores.overall_score)}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-left">
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Semantic Match</p>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${scores.semantic_score}%` }} />
                                </div>
                                <p className="text-sm mt-1">{Math.round(scores.semantic_score)}%</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Keyword Match</p>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${scores.keyword_score}%` }} />
                                </div>
                                <p className="text-sm mt-1">{Math.round(scores.keyword_score)}%</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Keywords Found</p>
                                <p className="text-lg font-semibold">
                                    {scores.matched_keywords?.length || 0} / {(scores.matched_keywords?.length || 0) + (scores.missing_keywords?.length || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Strengths */}
                    {strengths?.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 mb-4 text-emerald-500 font-semibold">
                                <Icon icon="mdi:check-circle" width="20" />
                                Strengths
                            </h3>
                            <ul className="space-y-2">
                                {strengths.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 px-4 py-2 bg-emerald-500/10 rounded-md text-sm text-foreground"
                                    >
                                        <Icon icon="mdi:check-circle" width="14" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Weaknesses */}
                    {weaknesses?.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 mb-4 text-yellow-500 font-semibold">
                                <Icon icon="mdi:alert" width="20" />
                                Areas for Improvement
                            </h3>
                            <ul className="space-y-2">
                                {weaknesses.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 px-4 py-2 bg-yellow-500/10 rounded-md text-sm text-foreground"
                                    >
                                        <Icon icon="mdi:alert" width="14" className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {recommendations?.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 mb-4 text-primary font-semibold">
                                <Icon icon="mdi:information" width="20" />
                                Recommendations
                            </h3>
                            <ul className="space-y-2">
                                {recommendations.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 px-4 py-2 bg-primary/10 rounded-md text-sm text-foreground"
                                    >
                                        <Icon icon="mdi:information" width="14" className="text-primary flex-shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Keywords Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scores.matched_keywords?.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 mb-2 text-muted-foreground font-medium">
                                    <Icon icon="mdi:target" width="16" />
                                    Matched Keywords
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {scores.matched_keywords.slice(0, 15).map((kw, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-xs border border-emerald-500/20"
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {scores.missing_keywords?.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 mb-2 text-muted-foreground font-medium">
                                    <Icon icon="mdi:trending-up" width="16" />
                                    Missing Keywords
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {scores.missing_keywords.slice(0, 15).map((kw, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 bg-destructive/10 text-destructive rounded-md text-xs border border-destructive/20"
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
                        <div>
                            <h4 className="flex items-center gap-2 mb-2 text-muted-foreground font-medium">
                                <Icon icon="mdi:file-document-outline" width="16" />
                                Formatting Notes
                            </h4>
                            <ul className="space-y-1">
                                {formatting_notes.map((note, i) => (
                                    <li key={i} className="text-muted-foreground text-sm">
                                        • {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-border bg-card sticky bottom-0">
                    <button className="btn btn-primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CritiqueModal;
