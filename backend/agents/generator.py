"""
Generator Agent - Creates resume content from user's ground truth.
"""

import json
import logging
from typing import Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from .base import BaseAgent

logger = logging.getLogger(__name__)


class GeneratorAgent(BaseAgent):
    """
    Agent responsible for generating resume content.
    Takes user's ground truth and optional job description to create
    a tailored, ATS-optimized resume.
    """
    
    name = "generator"
    description = "Generates resume content from user's career data"
    
    def get_prompt(self, state: Dict[str, Any]) -> str:
        """Generate the resume creation prompt."""
        
        ground_truth = state.get('ground_truth', {})
        job_description = state.get('job_description', '')
        
        # Get any feedback from previous iteration
        review_feedback = state.get('review_feedback', {})
        feedback_text = ""
        if review_feedback and state.get('should_regenerate'):
            suggestions = review_feedback.get('suggestions', [])
            feedback_text = f"\n\nPrevious feedback to incorporate:\n" + "\n".join(f"- {s}" for s in suggestions)
        
        prompt = f"""You are an expert resume writer and ATS optimization specialist.

Generate a professional, ATS-optimized resume based on the following career information.

USER'S CAREER DATA:
{json.dumps(ground_truth, indent=2)}

{"TARGET JOB DESCRIPTION:" if job_description else ""}
{job_description if job_description else "Generate a general-purpose resume."}
{feedback_text}

OUTPUT INSTRUCTIONS:
Generate a structured resume in JSON format with the following sections:
1. header - Contact information and professional title
2. summary - Compelling professional summary (2-3 sentences)
3. experience - Work experience entries with achievements
4. education - Educational background
5. skills - Technical and soft skills, organized by category
6. certifications - Professional certifications (if any)
7. projects - Notable projects (if any)

IMPORTANT:
- Use action verbs and quantifiable achievements
- Optimize for ATS keyword scanning
- Keep descriptions concise but impactful
- Tailor content to the job description if provided

Respond with ONLY valid JSON, no markdown formatting."""

        return prompt
    
    def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Generate resume content."""
        logger.info(f"Generator Agent processing for user {state.get('user_id')}")
        
        prompt = self.get_prompt(state)
        
        try:
            # Use LLM to generate content
            response = self.llm.invoke(prompt)
            
            # Parse response
            if hasattr(response, 'content'):
                content = response.content
            else:
                content = str(response)
            
            # Try to parse as JSON
            try:
                # Clean up response - remove markdown code blocks if present
                content = content.strip()
                if content.startswith('```json'):
                    content = content[7:]
                if content.startswith('```'):
                    content = content[3:]
                if content.endswith('```'):
                    content = content[:-3]
                
                generated_content = json.loads(content.strip())
            except json.JSONDecodeError:
                # If JSON parsing fails, structure the response
                generated_content = {
                    "raw_content": content,
                    "parse_error": True
                }
            
            # Update state
            state['generated_content'] = generated_content
            state['current_step'] = 'generated'
            state['iteration'] = state.get('iteration', 0) + 1
            
            logger.info(f"Generator Agent completed, iteration {state['iteration']}")
            
        except Exception as e:
            logger.error(f"Generator Agent error: {e}")
            state['errors'] = state.get('errors', []) + [f"Generator: {str(e)}"]
            # Provide fallback content based on ground truth
            state['generated_content'] = self._fallback_generation(state.get('ground_truth', {}))
            state['current_step'] = 'generated'
        
        return state
    
    def _fallback_generation(self, ground_truth: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a basic resume without LLM if it fails."""
        return {
            "header": ground_truth.get('personal_info', {}),
            "summary": ground_truth.get('summary', 'Experienced professional seeking new opportunities.'),
            "experience": ground_truth.get('experience', []),
            "education": ground_truth.get('education', []),
            "skills": ground_truth.get('skills', {}),
            "certifications": ground_truth.get('certifications', []),
            "projects": ground_truth.get('projects', []),
            "fallback": True
        }
