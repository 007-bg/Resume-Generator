"""
API ViewSets for the Resume Critique Agent.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import JobPosting, Candidate, CritiqueResult
from .serializers import (
    JobPostingSerializer,
    JobPostingDetailSerializer,
    CandidateSerializer,
    CandidateListSerializer,
    CritiqueResultSerializer,
    GenerateCritiqueSerializer
)
from critique.tasks import run_critique_pipeline


class JobPostingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing job postings.
    
    Endpoints:
    - GET /api/jobs/ - List all job postings
    - POST /api/jobs/ - Create a new job posting
    - GET /api/jobs/{id}/ - Retrieve a job posting with candidates
    - PUT /api/jobs/{id}/ - Update a job posting
    - DELETE /api/jobs/{id}/ - Delete a job posting
    """
    queryset = JobPosting.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobPostingDetailSerializer
        return JobPostingSerializer


class CandidateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing candidates.
    
    Endpoints:
    - GET /api/candidates/ - List all candidates
    - POST /api/candidates/ - Upload a new candidate resume
    - GET /api/candidates/{id}/ - Retrieve candidate details with critique
    - DELETE /api/candidates/{id}/ - Delete a candidate
    - POST /api/candidates/{id}/generate_critique/ - Trigger critique generation
    """
    queryset = Candidate.objects.select_related('critique', 'job_posting').all()
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CandidateListSerializer
        return CandidateSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by job_posting if provided
        job_id = self.request.query_params.get('job_id')
        if job_id:
            queryset = queryset.filter(job_posting_id=job_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def generate_critique(self, request, pk=None):
        """
        Trigger asynchronous critique generation for a candidate.
        
        Returns a 202 Accepted with the task_id for polling.
        """
        candidate = self.get_object()
        
        # Validate request
        serializer = GenerateCritiqueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Use provided job_id or candidate's linked job
        job_id = serializer.validated_data.get('job_id') or candidate.job_posting_id
        
        # Check if critique already exists and is processing
        critique, created = CritiqueResult.objects.get_or_create(
            candidate=candidate,
            defaults={'status': CritiqueResult.Status.PENDING}
        )
        
        if critique.status == CritiqueResult.Status.PROCESSING:
            return Response({
                'status': 'already_processing',
                'task_id': critique.task_id,
                'message': 'Critique generation is already in progress.'
            }, status=status.HTTP_409_CONFLICT)
        
        # Reset critique if re-running
        if not created:
            critique.status = CritiqueResult.Status.PENDING
            critique.overall_score = None
            critique.keyword_score = None
            critique.semantic_score = None
            critique.result_json = None
            critique.error_message = ''
            critique.completed_at = None
            critique.save()
        
        # Trigger async task
        task = run_critique_pipeline.delay(str(candidate.id), str(job_id))
        
        # Store task ID
        critique.task_id = task.id
        critique.status = CritiqueResult.Status.PROCESSING
        critique.save(update_fields=['task_id', 'status'])
        
        return Response({
            'status': 'processing',
            'task_id': task.id,
            'message': 'Critique generation started.'
        }, status=status.HTTP_202_ACCEPTED)


class CritiqueResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing critique results (read-only).
    
    Endpoints:
    - GET /api/critiques/ - List all critique results
    - GET /api/critiques/{id}/ - Retrieve a specific critique result
    - GET /api/critiques/by_task/{task_id}/ - Retrieve critique by Celery task ID
    """
    queryset = CritiqueResult.objects.select_related('candidate').all()
    serializer_class = CritiqueResultSerializer
    
    @action(detail=False, methods=['get'], url_path='by_task/(?P<task_id>[^/.]+)')
    def by_task(self, request, task_id=None):
        """
        Retrieve a critique result by its Celery task ID.
        Useful for polling the status of an async critique job.
        """
        critique = get_object_or_404(CritiqueResult, task_id=task_id)
        serializer = self.get_serializer(critique)
        return Response(serializer.data)
