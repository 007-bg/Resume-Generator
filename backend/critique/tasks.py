"""
Celery tasks for asynchronous critique generation.
"""

import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def run_critique_pipeline(self, candidate_id: str, job_id: str):
    """
    Asynchronous task to run the full critique pipeline.
    
    Args:
        candidate_id: UUID of the Candidate
        job_id: UUID of the JobPosting
        
    This task:
    1. Loads the candidate and job posting
    2. Extracts text from the resume PDF
    3. Runs the hybrid scoring engine
    4. Generates qualitative feedback
    5. Saves results to CritiqueResult
    """
    from api.models import Candidate, JobPosting, CritiqueResult
    from .parser import extract_text_from_pdf
    from .services import run_full_critique, critique_to_dict
    
    logger.info(f"Starting critique pipeline for candidate {candidate_id}")
    
    try:
        # Load models
        candidate = Candidate.objects.select_related('critique').get(id=candidate_id)
        job_posting = JobPosting.objects.get(id=job_id)
        critique = candidate.critique
        
        # Update status to processing
        critique.status = CritiqueResult.Status.PROCESSING
        critique.save(update_fields=['status'])
        
        # Step 1: Extract resume text
        logger.info(f"Extracting text from resume: {candidate.resume_file.name}")
        
        if not candidate.resume_text:
            resume_text = extract_text_from_pdf(candidate.resume_file)
            candidate.resume_text = resume_text
            candidate.save(update_fields=['resume_text'])
        else:
            resume_text = candidate.resume_text
        
        if not resume_text or len(resume_text.strip()) < 50:
            raise ValueError("Could not extract sufficient text from resume")
        
        # Step 2: Get job description text
        jd_text = f"{job_posting.title}\n\n{job_posting.description}"
        if job_posting.requirements:
            jd_text += f"\n\nRequirements:\n{job_posting.requirements}"
        
        # Step 3: Run full critique
        logger.info("Running critique analysis...")
        detailed_critique = run_full_critique(resume_text, jd_text)
        
        # Step 4: Save results
        critique.overall_score = detailed_critique.scores.overall_score
        critique.keyword_score = detailed_critique.scores.keyword_score
        critique.semantic_score = detailed_critique.scores.semantic_score
        critique.result_json = critique_to_dict(detailed_critique)
        critique.status = CritiqueResult.Status.COMPLETED
        critique.completed_at = timezone.now()
        critique.error_message = ''
        critique.save()
        
        logger.info(
            f"Critique completed for {candidate.name}: "
            f"Score={critique.overall_score:.2f}"
        )
        
        return {
            'status': 'completed',
            'candidate_id': str(candidate_id),
            'overall_score': critique.overall_score,
        }
        
    except Candidate.DoesNotExist:
        logger.error(f"Candidate {candidate_id} not found")
        return {'status': 'error', 'message': 'Candidate not found'}
        
    except JobPosting.DoesNotExist:
        logger.error(f"JobPosting {job_id} not found")
        _mark_critique_failed(candidate_id, "Job posting not found")
        return {'status': 'error', 'message': 'Job posting not found'}
        
    except Exception as e:
        logger.exception(f"Critique pipeline failed: {e}")
        _mark_critique_failed(candidate_id, str(e))
        
        # Retry on transient errors
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        
        return {'status': 'error', 'message': str(e)}


def _mark_critique_failed(candidate_id: str, error_message: str):
    """Helper to mark a critique as failed."""
    from api.models import Candidate, CritiqueResult
    
    try:
        candidate = Candidate.objects.get(id=candidate_id)
        if hasattr(candidate, 'critique'):
            critique = candidate.critique
            critique.status = CritiqueResult.Status.FAILED
            critique.error_message = error_message[:1000]  # Limit error length
            critique.save(update_fields=['status', 'error_message'])
    except Exception as e:
        logger.error(f"Failed to mark critique as failed: {e}")


@shared_task
def cleanup_old_critiques(days_old: int = 30):
    """
    Periodic task to clean up old critique data.
    
    Removes critique results older than specified days to manage storage.
    """
    from api.models import CritiqueResult
    from datetime import timedelta
    
    cutoff_date = timezone.now() - timedelta(days=days_old)
    
    old_critiques = CritiqueResult.objects.filter(
        created_at__lt=cutoff_date,
        status=CritiqueResult.Status.COMPLETED
    )
    
    count = old_critiques.count()
    old_critiques.delete()
    
    logger.info(f"Cleaned up {count} old critique results")
    return {'deleted': count}
