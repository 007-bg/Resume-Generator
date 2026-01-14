"""
API views for the multi-agent system.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from api.models import Resume
from api.serializers import ResumeSerializer
from .tasks import run_resume_pipeline


class AgentViewSet(viewsets.ViewSet):
    """
    ViewSet for multi-agent resume operations.
    
    Endpoints:
    - POST /api/agents/generate/ - Generate a resume using agents
    - GET /api/agents/status/{resume_id}/ - Get generation status
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Trigger multi-agent resume generation.
        
        Request body:
        {
            "job_description": "optional job description",
            "title": "optional resume title"
        }
        """
        user = request.user
        profile = user.profile
        
        # Check if user has ground truth
        if not profile.ground_truth:
            return Response({
                'error': 'Please complete your profile first',
                'completion_percentage': profile.completion_percentage
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create resume instance
        resume = Resume.objects.create(
            user=user,
            title=request.data.get('title', f"Resume - {user.username}"),
            status=Resume.Status.PENDING,
        )
        
        # If job description provided, link or store it
        job_description = request.data.get('job_description', '')
        
        # Trigger async pipeline
        task = run_resume_pipeline.delay(
            resume_id=str(resume.id),
            user_id=str(user.id),
            ground_truth=profile.ground_truth,
            job_description=job_description
        )
        
        # Store task ID
        resume.task_id = task.id
        resume.save(update_fields=['task_id'])
        
        return Response({
            'status': 'processing',
            'resume_id': str(resume.id),
            'task_id': task.id,
            'message': 'Resume generation started'
        }, status=status.HTTP_202_ACCEPTED)
    
    @action(detail=False, methods=['get'], url_path='status/(?P<resume_id>[^/.]+)')
    def status(self, request, resume_id=None):
        """Get the status of a resume generation."""
        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return Response({
                'error': 'Resume not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        response = {
            'resume_id': str(resume.id),
            'status': resume.status,
            'created_at': resume.created_at,
        }
        
        if resume.status == Resume.Status.COMPLETED:
            response.update({
                'content': resume.content,
                'match_score': resume.match_score,
                'agent_outputs': resume.agent_outputs,
                'completed_at': resume.completed_at
            })
        elif resume.status == Resume.Status.FAILED:
            response['error'] = resume.error_message
        
        return Response(response)
