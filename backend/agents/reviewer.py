"""
Reviewer Agent - Reviews and provides feedback on generated resume.
"""

import json
import logging
from typing import Dict, Any

from .base import BaseAgent

logger = logging.getLogger(__name__)


class ReviewerAgent(BaseAgent):
    """
    Agent responsible for reviewing generated resumes.
    Checks for quality, ATS optimization, and provides feedback.
    """
    
    name = "reviewer"
    description = "Reviews resume for quality and ATS optimization"
    
    def get_prompt(self, state: Dict[str, Any]) -> str:
        """Generate the review prompt."""
        
        generated_content = state.get('generated_content', {})
        job_description = state.get('job_description', '')
        
        prompt = f"""You are an expert resume reviewer and ATS specialist.

Review the following generated resume content and provide detailed feedback.

GENERATED RESUME:
{json.dumps(generated_content, indent=2)}

{"TARGET JOB DESCRIPTION:" if job_description else ""}
{job_description if job_description else "Review for general quality."}

REVIEW CRITERIA:
1. ATS Optimization - Are keywords properly used? Will it pass ATS scans?
2. Content Quality - Are achievements quantified? Is language impactful?
3. Structure - Is the format clean and professional?
4. Relevance - Does content align with the target role?
5. Grammar & Clarity - Are there any errors or unclear statements?

OUTPUT FORMAT (JSON):
{{
    "overall_quality": "excellent|good|fair|poor",
    "ats_score": 0-100,
    "strengths": ["list of strengths"],
    "weaknesses": ["list of weaknesses"],
    "suggestions": ["list of specific improvements"],
    "missing_keywords": ["keywords from JD not in resume"],
    "should_regenerate": true/false,
    "regeneration_reason": "reason if should_regenerate is true"
}}

Respond with ONLY valid JSON."""

        return prompt
    
    def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Review the generated resume."""
        logger.info(f"Reviewer Agent processing for user {state.get('user_id')}")
        
        # Skip if no generated content
        if not state.get('generated_content'):
            logger.warning("No generated content to review")
            state['current_step'] = 'reviewed'
            return state
        
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
                
                review_feedback = json.loads(content.strip())
            except json.JSONDecodeError:
                review_feedback = {
                    "overall_quality": "good",
                    "ats_score": 70,
                    "strengths": ["Content generated successfully"],
                    "weaknesses": ["Review parsing failed"],
                    "suggestions": [],
                    "should_regenerate": False,
                    "raw_response": content
                }
            
            # Update state
            state['review_feedback'] = review_feedback
            state['should_regenerate'] = review_feedback.get('should_regenerate', False)
            state['current_step'] = 'reviewed'
            
            logger.info(f"Reviewer Agent completed. Quality: {review_feedback.get('overall_quality')}")
            
        except Exception as e:
            logger.error(f"Reviewer Agent error: {e}")
            state['errors'] = state.get('errors', []) + [f"Reviewer: {str(e)}"]
            state['review_feedback'] = {
                "overall_quality": "unknown",
                "ats_score": 50,
                "error": str(e),
                "should_regenerate": False
            }
            state['current_step'] = 'reviewed'
        
        return state
