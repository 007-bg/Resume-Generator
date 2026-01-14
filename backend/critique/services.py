"""
Critique services implementing the hybrid scoring engine.
Uses spaCy for NER and sentence-transformers for semantic similarity.
"""

import re
import logging
from typing import Dict, List, Set, Tuple, Optional
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

# Lazy loading of heavy ML models
_nlp = None
_sentence_model = None


def get_nlp():
    """Lazy load spaCy model."""
    global _nlp
    if _nlp is None:
        try:
            import spacy
            # Try transformer model first, fall back to smaller model
            try:
                _nlp = spacy.load("en_core_web_trf")
                logger.info("Loaded spaCy transformer model")
            except OSError:
                _nlp = spacy.load("en_core_web_sm")
                logger.info("Loaded spaCy small model (transformer not available)")
        except ImportError:
            logger.error("spaCy not installed")
            raise
    return _nlp


def get_sentence_model():
    """Lazy load sentence-transformers model."""
    global _sentence_model
    if _sentence_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Loaded sentence-transformers model")
        except ImportError:
            logger.error("sentence-transformers not installed")
            raise
    return _sentence_model


# Technical skills dictionary for enhanced NER
TECH_SKILLS = {
    # Programming Languages
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'go', 'golang',
    'rust', 'swift', 'kotlin', 'php', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash',
    
    # Web Frameworks
    'react', 'reactjs', 'angular', 'vue', 'vuejs', 'django', 'flask', 'fastapi',
    'express', 'nodejs', 'node.js', 'nextjs', 'next.js', 'spring', 'rails', 'laravel',
    
    # Data Science & ML
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy',
    'matplotlib', 'seaborn', 'jupyter', 'machine learning', 'deep learning', 'nlp',
    'computer vision', 'data science', 'data analysis', 'statistics',
    
    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform',
    'jenkins', 'ci/cd', 'github actions', 'gitlab', 'circleci', 'ansible', 'puppet',
    
    # Databases
    'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch',
    'dynamodb', 'cassandra', 'oracle', 'sqlite', 'neo4j', 'graphql',
    
    # Tools & Practices
    'git', 'github', 'jira', 'confluence', 'agile', 'scrum', 'kanban', 'rest', 'restful',
    'api', 'microservices', 'serverless', 'linux', 'unix', 'windows server',
    
    # Soft Skills (commonly required)
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
    'project management', 'time management', 'presentation', 'collaboration',
}


@dataclass
class CritiqueScore:
    """Container for critique scoring results."""
    overall_score: float
    keyword_score: float
    semantic_score: float
    matched_keywords: List[str]
    missing_keywords: List[str]
    resume_keywords: List[str]
    jd_keywords: List[str]


@dataclass
class DetailedCritique:
    """Full critique results including qualitative feedback."""
    scores: CritiqueScore
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    formatting_notes: List[str]


def extract_keywords(text: str) -> Set[str]:
    """
    Extract keywords from text using spaCy NER and pattern matching.
    
    Combines:
    - Named Entity Recognition (ORG, PRODUCT, etc.)
    - Dictionary-based technical skill matching
    - Noun phrase extraction
    """
    keywords = set()
    text_lower = text.lower()
    
    # Dictionary-based skill extraction (case-insensitive)
    for skill in TECH_SKILLS:
        # Use word boundary matching for multi-word skills
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            keywords.add(skill)
    
    # spaCy NER extraction
    try:
        nlp = get_nlp()
        doc = nlp(text[:100000])  # Limit text length for performance
        
        # Extract relevant entity types
        for ent in doc.ents:
            if ent.label_ in ('ORG', 'PRODUCT', 'GPE', 'EVENT', 'WORK_OF_ART'):
                keywords.add(ent.text.lower())
        
        # Extract noun chunks (noun phrases)
        for chunk in doc.noun_chunks:
            # Only include short, meaningful phrases
            if 1 <= len(chunk.text.split()) <= 3:
                chunk_lower = chunk.text.lower().strip()
                if len(chunk_lower) > 2:
                    keywords.add(chunk_lower)
                    
    except Exception as e:
        logger.warning(f"spaCy extraction failed: {e}")
    
    return keywords


def calculate_jaccard_similarity(set1: Set[str], set2: Set[str]) -> float:
    """
    Calculate Jaccard similarity between two sets.
    
    J(A,B) = |A ∩ B| / |A ∪ B|
    """
    if not set1 or not set2:
        return 0.0
    
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    
    return intersection / union if union > 0 else 0.0


def calculate_semantic_similarity(text1: str, text2: str) -> float:
    """
    Calculate semantic similarity using sentence embeddings.
    
    Uses cosine similarity between dense vector representations.
    """
    try:
        from sentence_transformers import util
        
        model = get_sentence_model()
        
        # Truncate texts for embedding (model has max length)
        text1_truncated = text1[:10000]
        text2_truncated = text2[:10000]
        
        # Generate embeddings
        embeddings = model.encode([text1_truncated, text2_truncated])
        
        # Calculate cosine similarity
        cosine_sim = util.cos_sim(embeddings[0], embeddings[1]).item()
        
        # Normalize to 0-1 range (cosine can be negative)
        return max(0.0, cosine_sim)
        
    except Exception as e:
        logger.error(f"Semantic similarity calculation failed: {e}")
        return 0.5  # Default neutral score on error


def calculate_hybrid_score(
    resume_text: str,
    jd_text: str,
    keyword_weight: float = 0.3,
    semantic_weight: float = 0.7
) -> CritiqueScore:
    """
    Calculate hybrid score combining keyword overlap and semantic similarity.
    
    Args:
        resume_text: Extracted resume text
        jd_text: Job description text
        keyword_weight: Weight for Jaccard similarity (default 30%)
        semantic_weight: Weight for semantic similarity (default 70%)
        
    Returns:
        CritiqueScore with detailed breakdown
    """
    # Extract keywords
    resume_keywords = extract_keywords(resume_text)
    jd_keywords = extract_keywords(jd_text)
    
    # Calculate Jaccard similarity (keyword overlap)
    jaccard_sim = calculate_jaccard_similarity(resume_keywords, jd_keywords)
    
    # Calculate semantic similarity
    semantic_sim = calculate_semantic_similarity(resume_text, jd_text)
    
    # Calculate weighted final score
    final_score = (keyword_weight * jaccard_sim) + (semantic_weight * semantic_sim)
    
    # Identify matched and missing keywords
    matched = resume_keywords.intersection(jd_keywords)
    missing = jd_keywords - resume_keywords
    
    return CritiqueScore(
        overall_score=round(final_score * 100, 2),
        keyword_score=round(jaccard_sim * 100, 2),
        semantic_score=round(semantic_sim * 100, 2),
        matched_keywords=sorted(list(matched)),
        missing_keywords=sorted(list(missing)),
        resume_keywords=sorted(list(resume_keywords)),
        jd_keywords=sorted(list(jd_keywords))
    )


def generate_qualitative_feedback(
    resume_text: str,
    jd_text: str,
    scores: CritiqueScore
) -> Tuple[List[str], List[str], List[str]]:
    """
    Generate qualitative feedback based on the critique analysis.
    
    Returns (strengths, weaknesses, recommendations)
    """
    strengths = []
    weaknesses = []
    recommendations = []
    
    # Score-based feedback
    if scores.overall_score >= 80:
        strengths.append("Excellent overall match with the job requirements")
    elif scores.overall_score >= 60:
        strengths.append("Good alignment with core job requirements")
    elif scores.overall_score >= 40:
        weaknesses.append("Moderate alignment - some key areas need improvement")
    else:
        weaknesses.append("Low alignment with job requirements - significant gaps identified")
    
    # Keyword-based feedback
    if scores.keyword_score >= 70:
        strengths.append("Strong keyword coverage matching the job description")
    elif scores.keyword_score < 40:
        weaknesses.append("Limited keyword overlap with job requirements")
        recommendations.append("Consider incorporating more relevant keywords from the job description")
    
    # Missing skills analysis
    if len(scores.missing_keywords) > 10:
        critical_missing = [k for k in scores.missing_keywords[:5]]
        if critical_missing:
            recommendations.append(
                f"Key skills to add or highlight: {', '.join(critical_missing)}"
            )
    
    # Matched skills recognition
    if len(scores.matched_keywords) >= 5:
        top_matches = scores.matched_keywords[:5]
        strengths.append(
            f"Strong matches found: {', '.join(top_matches)}"
        )
    
    # Semantic analysis feedback
    if scores.semantic_score >= 75:
        strengths.append("Resume content is semantically aligned with the role expectations")
    elif scores.semantic_score < 50:
        weaknesses.append("Resume content could better reflect the role's context and language")
        recommendations.append("Consider rephrasing accomplishments to align with industry terminology")
    
    # Length-based heuristics
    word_count = len(resume_text.split())
    if word_count < 200:
        weaknesses.append("Resume appears too brief - consider adding more detail")
        recommendations.append("Expand on key accomplishments and responsibilities")
    elif word_count > 1500:
        weaknesses.append("Resume may be too detailed for initial screening")
        recommendations.append("Consider condensing to highlight most relevant experience")
    
    return strengths, weaknesses, recommendations


def analyze_formatting(resume_text: str) -> List[str]:
    """
    Analyze resume formatting and structure.
    
    Returns list of formatting observations/suggestions.
    """
    notes = []
    
    # Check for section presence
    sections = {
        'summary': r'(?i)(summary|objective|profile)',
        'experience': r'(?i)(experience|employment|work history)',
        'education': r'(?i)(education|academic)',
        'skills': r'(?i)(skills|competencies|technologies)',
    }
    
    for section, pattern in sections.items():
        if not re.search(pattern, resume_text):
            notes.append(f"Consider adding a clear '{section.title()}' section")
    
    # Check for bullet points
    if '•' not in resume_text and '-' not in resume_text:
        notes.append("Use bullet points to improve readability and ATS parsing")
    
    # Check for quantifiable achievements
    if not re.search(r'\d+%|\$\d+|\d+\s*(years?|months?)', resume_text):
        notes.append("Add quantifiable achievements (percentages, dollar amounts, timeframes)")
    
    # Check for action verbs at the start of lines
    action_verbs = ['achieved', 'developed', 'led', 'managed', 'created', 'implemented',
                    'increased', 'reduced', 'improved', 'designed', 'built', 'launched']
    has_action_verbs = any(
        resume_text.lower().startswith(verb) or f'\n{verb}' in resume_text.lower()
        for verb in action_verbs
    )
    if not has_action_verbs:
        notes.append("Start bullet points with strong action verbs")
    
    return notes if notes else ["Resume formatting appears well-structured"]


def run_full_critique(resume_text: str, jd_text: str) -> DetailedCritique:
    """
    Run the complete critique pipeline.
    
    Returns a DetailedCritique with all analysis results.
    """
    # Calculate hybrid score
    scores = calculate_hybrid_score(resume_text, jd_text)
    
    # Generate qualitative feedback
    strengths, weaknesses, recommendations = generate_qualitative_feedback(
        resume_text, jd_text, scores
    )
    
    # Analyze formatting
    formatting_notes = analyze_formatting(resume_text)
    
    return DetailedCritique(
        scores=scores,
        strengths=strengths,
        weaknesses=weaknesses,
        recommendations=recommendations,
        formatting_notes=formatting_notes
    )


def critique_to_dict(critique: DetailedCritique) -> dict:
    """Convert DetailedCritique to JSON-serializable dict."""
    return {
        'scores': asdict(critique.scores),
        'strengths': critique.strengths,
        'weaknesses': critique.weaknesses,
        'recommendations': critique.recommendations,
        'formatting_notes': critique.formatting_notes,
    }
