"""
Analyzer Agent - Analyzes resume match against job description.
"""

import json
import logging
from typing import Dict, Any

from .base import BaseAgent
from critique.services import calculate_hybrid_score

logger = logging.getLogger(__name__)


class AnalyzerAgent(BaseAgent):
    """
    Agent responsible for analyzing resume-job match.
    Uses NLP scoring + LLM insights for comprehensive analysis.
    """
    
    name = "analyzer"
    description = "Analyzes resume-job description match"
    
    def get_prompt(self, state: Dict[str, Any]) -> str:
        """Generate the analysis prompt."""
        
        generated_content = state.get('generated_content', {})
        job_description = state.get('job_description', '')
        review_feedback = state.get('review_feedback', {})
        
        prompt = f"""You are an expert job match analyzer.

Analyze how well this resume matches the job requirements.

RESUME CONTENT:
{json.dumps(generated_content, indent=2)}

JOB DESCRIPTION:
{job_description if job_description else "No specific job provided - analyze general marketability."}

REVIEW FEEDBACK:
ATS Score: {review_feedback.get('ats_score', 'N/A')}
Quality: {review_feedback.get('overall_quality', 'N/A')}

ANALYSIS REQUIREMENTS:
1. Calculate an overall match score (0-100)
2. Identify key matching qualifications
3. Identify gaps or missing requirements
4. Provide specific recommendations to improve match
5. Assess competitiveness against other candidates

OUTPUT FORMAT (JSON):
{{
    "match_score": 0-100,
    "match_level": "excellent|strong|moderate|weak",
    "matching_qualifications": ["list of matching points"],
    "gaps": ["missing requirements or skills"],
    "recommendations": ["specific improvements"],
    "competitive_assessment": "summary of candidate's competitive position",
    "key_strengths": ["top 3 strengths for this role"],
    "interview_tips": ["tips for interview based on this match"]
}}

Respond with ONLY valid JSON."""

        return prompt
    
    def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the resume against job description."""
        logger.info(f"Analyzer Agent processing for user {state.get('user_id')}")
        
        generated_content = state.get('generated_content', {})
        job_description = state.get('job_description', '')
        
        # Calculate NLP-based score if we have job description
        nlp_score = None
        if job_description and generated_content:
            try:
                # Convert resume to text for NLP analysis
                resume_text = self._content_to_text(generated_content)
                nlp_result = calculate_hybrid_score(resume_text, job_description)
                nlp_score = nlp_result.overall_score
            except Exception as e:
                logger.warning(f"NLP scoring failed: {e}")
        
        # Get LLM analysis
        prompt = self.get_prompt(state)
        
        try:
            response = self.llm.invoke(prompt)
            
            if hasattr(response, 'content'):
                content = response.content
            else:
                content = str(response)
            
            # Parse JSON response
            try:
                content = content.strip()
                if content.startswith('```json'):
                    content = content[7:]
                if content.startswith('```'):
                    content = content[3:]
                if content.endswith('```'):
                    content = content[:-3]
                
                analysis_result = json.loads(content.strip())
            except json.JSONDecodeError:
                analysis_result = {
                    "match_score": nlp_score or 50,
                    "match_level": "moderate",
                    "error": "Analysis parsing failed",
                    "raw_response": content
                }
            
            # Combine NLP and LLM scores
            if nlp_score is not None:
                llm_score = analysis_result.get('match_score', 50)
                # Weighted average: 60% NLP, 40% LLM
                combined_score = (0.6 * nlp_score) + (0.4 * llm_score)
                analysis_result['nlp_score'] = nlp_score
                analysis_result['llm_score'] = llm_score
                analysis_result['match_score'] = round(combined_score, 2)
            
            # Update state
            state['analysis_result'] = analysis_result
            state['overall_score'] = analysis_result.get('match_score')
            state['current_step'] = 'analyzed'
            
            # Finalize the resume
            state['final_resume'] = self._create_final_resume(state)
            
            logger.info(f"Analyzer Agent completed. Score: {state['overall_score']}")
            
        except Exception as e:
            logger.error(f"Analyzer Agent error: {e}")
            state['errors'] = state.get('errors', []) + [f"Analyzer: {str(e)}"]
            state['analysis_result'] = {
                "match_score": nlp_score or 50,
                "error": str(e)
            }
            state['overall_score'] = nlp_score or 50
            state['current_step'] = 'analyzed'
            state['final_resume'] = self._create_final_resume(state)
        
        return state
    
    def _content_to_text(self, content: Dict[str, Any]) -> str:
        """Convert resume content dict to plain text for NLP."""
        parts = []
        
        if 'summary' in content:
            parts.append(content['summary'])
        
        if 'experience' in content:
            for exp in content.get('experience', []):
                parts.append(f"{exp.get('title', '')} at {exp.get('company', '')}")
                parts.append(exp.get('description', ''))
                parts.extend(exp.get('achievements', []))
        
        if 'skills' in content:
            skills = content['skills']
            if isinstance(skills, dict):
                for category, skill_list in skills.items():
                    if isinstance(skill_list, list):
                        parts.extend(skill_list)
            elif isinstance(skills, list):
                parts.extend(skills)
        
        return ' '.join(str(p) for p in parts if p)
    
    def _create_final_resume(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Create the final resume object."""
        return {
            "content": state.get('generated_content', {}),
            "review": state.get('review_feedback', {}),
            "analysis": state.get('analysis_result', {}),
            "score": state.get('overall_score'),
            "iterations": state.get('iteration', 1),
            "errors": state.get('errors', [])
        }
