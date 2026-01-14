import { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiAlertTriangle, FiInfo, FiFileText, FiTrendingUp, FiTarget } from 'react-icons/fi';
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
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
                <div className="bg-navy-dark border border-sky/20 rounded-lg max-w-xl w-full shadow-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-sky/10">
                        <h2 className="text-xl font-bold">Loading Analysis...</h2>
                        <button className="btn btn-ghost p-2" onClick={onClose}>
                            <FiX size={18} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="skeleton h-24" />
                        <div className="skeleton h-36" />
                        <div className="skeleton h-36" />
                    </div>
                </div>
            </div>
        );
    }

    if (!critique || !critique.result_json) {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
                <div className="bg-navy-dark border border-sky/20 rounded-lg max-w-xl w-full shadow-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-sky/10">
                        <h2 className="text-xl font-bold">Analysis Error</h2>
                        <button className="btn btn-ghost p-2" onClick={onClose}>
                            <FiX size={18} />
                        </button>
                    </div>
                    <div className="p-6 text-center">
                        <FiAlertTriangle size={48} className="text-coral mx-auto mb-4" />
                        <p>Failed to load critique results</p>
                        {critique?.error_message && (
                            <p className="text-sky/50 mt-2">{critique.error_message}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 p-6 border-t border-sky/10">
                        <button className="btn btn-primary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

    const { scores, strengths, weaknesses, recommendations, formatting_notes } = critique.result_json;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
            <div
                className="bg-navy-dark border border-sky/20 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-sky/10">
                    <div>
                        <h2 className="text-xl font-bold">Resume Analysis</h2>
                        <p className="text-sky/70">{candidateName}</p>
                    </div>
                    <button className="btn btn-ghost p-2" onClick={onClose}>
                        <FiX size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Score Overview */}
                    <div className="bg-navy rounded-lg p-8 text-center">
                        <div className={`score-badge ${getScoreClass(scores.overall_score)} text-3xl font-bold px-8 py-4 mb-2`}>
                            {Math.round(scores.overall_score)}%
                        </div>
                        <p className="text-lg font-medium">
                            {getScoreLabel(scores.overall_score)}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-left">
                            <div>
                                <p className="text-sky/50 text-xs mb-1">Semantic Match</p>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${scores.semantic_score}%` }} />
                                </div>
                                <p className="text-sm mt-1">{Math.round(scores.semantic_score)}%</p>
                            </div>

                            <div>
                                <p className="text-sky/50 text-xs mb-1">Keyword Match</p>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${scores.keyword_score}%` }} />
                                </div>
                                <p className="text-sm mt-1">{Math.round(scores.keyword_score)}%</p>
                            </div>

                            <div>
                                <p className="text-sky/50 text-xs mb-1">Keywords Found</p>
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
                                <FiCheckCircle size={20} />
                                Strengths
                            </h3>
                            <ul className="space-y-2">
                                {strengths.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 px-4 py-2 bg-emerald-500/15 rounded-sm text-sm"
                                    >
                                        <FiCheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Weaknesses */}
                    {weaknesses?.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 mb-4 text-cream font-semibold">
                                <FiAlertTriangle size={20} />
                                Areas for Improvement
                            </h3>
                            <ul className="space-y-2">
                                {weaknesses.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 px-4 py-2 bg-cream/15 rounded-sm text-sm"
                                    >
                                        <FiAlertTriangle size={14} className="text-cream flex-shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {recommendations?.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 mb-4 text-sky font-semibold">
                                <FiInfo size={20} />
                                Recommendations
                            </h3>
                            <ul className="space-y-2">
                                {recommendations.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 px-4 py-2 bg-sky/15 rounded-sm text-sm"
                                    >
                                        <FiInfo size={14} className="text-sky flex-shrink-0 mt-0.5" />
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
                                <h4 className="flex items-center gap-2 mb-2 text-sky/70 font-medium">
                                    <FiTarget size={16} />
                                    Matched Keywords
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {scores.matched_keywords.slice(0, 15).map((kw, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 bg-emerald-500/15 text-emerald-500 rounded-sm text-xs"
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {scores.missing_keywords?.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 mb-2 text-sky/70 font-medium">
                                    <FiTrendingUp size={16} />
                                    Missing Keywords
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {scores.missing_keywords.slice(0, 15).map((kw, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 bg-coral/15 text-coral rounded-sm text-xs"
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
                            <h4 className="flex items-center gap-2 mb-2 text-sky/70 font-medium">
                                <FiFileText size={16} />
                                Formatting Notes
                            </h4>
                            <ul className="space-y-1">
                                {formatting_notes.map((note, i) => (
                                    <li key={i} className="text-sky/60 text-sm">
                                        • {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-sky/10">
                    <button className="btn btn-primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CritiqueModal;
