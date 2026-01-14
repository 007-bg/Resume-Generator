"""
Celery tasks for the multi-agent resume pipeline.
"""

import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2, default_retry_delay=60)
def run_resume_pipeline(
    self,
    resume_id: str,
    user_id: str,
    ground_truth: dict,
    job_description: str = None
):
    """
    Async task to run the multi-agent resume generation pipeline.
    
    Args:
        resume_id: Resume model instance ID
        user_id: User ID
        ground_truth: User's career data
        job_description: Optional job description for targeting
    """
    from api.models import Resume
    from .orchestrator import get_orchestrator
    
    logger.info(f"Starting pipeline task for resume {resume_id}")
    
    try:
        # Get resume instance
        resume = Resume.objects.get(id=resume_id)
        resume.status = Resume.Status.PROCESSING
        resume.save(update_fields=['status'])
        
        # Run the pipeline
        orchestrator = get_orchestrator()
        result = orchestrator.run(
            user_id=user_id,
            ground_truth=ground_truth,
            job_description=job_description
        )
        
        # Save results
        resume.content = result.get('final_resume', {}).get('content', {})
        resume.agent_outputs = {
            'generator': result.get('generated_content'),
            'reviewer': result.get('review_feedback'),
            'analyzer': result.get('analysis_result'),
            'iterations': result.get('iteration', 1),
            'errors': result.get('errors', [])
        }
        resume.match_score = result.get('overall_score')
        resume.status = Resume.Status.COMPLETED
        resume.completed_at = timezone.now()
        resume.save()
        
        logger.info(f"Pipeline completed for resume {resume_id}. Score: {resume.match_score}")
        
        return {
            'status': 'completed',
            'resume_id': str(resume_id),
            'score': resume.match_score
        }
        
    except Resume.DoesNotExist:
        logger.error(f"Resume {resume_id} not found")
        return {'status': 'error', 'message': 'Resume not found'}
        
    except Exception as e:
        logger.exception(f"Pipeline task failed: {e}")
        
        # Update resume status
        try:
            resume = Resume.objects.get(id=resume_id)
            resume.status = Resume.Status.FAILED
            resume.error_message = str(e)[:1000]
            resume.save(update_fields=['status', 'error_message'])
        except Exception:
            pass
        
        # Retry on transient errors
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        
        return {'status': 'error', 'message': str(e)}


@shared_task
def run_single_agent(resume_id: str, agent_name: str, state: dict):
    """
    Run a single agent for debugging or step-by-step execution.
    """
    from .orchestrator import get_orchestrator
    
    orchestrator = get_orchestrator()
    result = orchestrator.run_step(state, agent_name)
    
    return {
        'agent': agent_name,
        'result': result
    }
