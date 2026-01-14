"""
Data models for the Resume Critique Agent.
Extended with Resume and AgentOutput for multi-agent system.
"""

from django.db import models
from django.contrib.auth.models import User
import uuid


class JobPosting(models.Model):
    """Represents a job vacancy."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_postings', null=True, blank=True)
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    embedding = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} at {self.company}" if self.company else self.title
    
    @property
    def candidate_count(self):
        return self.candidates.count()


class Resume(models.Model):
    """
    Represents a generated resume.
    Stores all content as JSONB for flexible schema.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=255)
    
    # Target job (optional)
    target_job = models.ForeignKey(
        JobPosting, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='targeted_resumes'
    )
    
    # Resume content stored as JSONB
    content = models.JSONField(default=dict, blank=True)
    """
    Expected content structure:
    {
        "header": {...},
        "summary": "...",
        "experience": [...],
        "education": [...],
        "skills": {...},
        "certifications": [...],
        "projects": [...]
    }
    """
    
    # Agent outputs stored as JSONB
    agent_outputs = models.JSONField(default=dict, blank=True)
    """
    {
        "generator": {...},
        "reviewer": {...},
        "analyzer": {...},
        "iterations": 2,
        "errors": []
    }
    """
    
    # Scoring
    match_score = models.FloatField(null=True, blank=True)
    
    # Task tracking
    task_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    error_message = models.TextField(blank=True)
    
    # Versioning
    version = models.IntegerField(default=1)
    is_published = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.username} (v{self.version})"


class Candidate(models.Model):
    """Represents an applicant for a job posting."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='candidates')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    resume_file = models.FileField(upload_to='resumes/%Y/%m/')
    resume_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.job_posting.title}"


class CritiqueResult(models.Model):
    """Stores analysis results for a candidate."""
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.OneToOneField(Candidate, on_delete=models.CASCADE, related_name='critique')
    task_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    overall_score = models.FloatField(null=True, blank=True)
    keyword_score = models.FloatField(null=True, blank=True)
    semantic_score = models.FloatField(null=True, blank=True)
    result_json = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Critique for {self.candidate.name}: {self.status}"


class JobApplication(models.Model):
    """
    Tracks user's job applications with status workflow.
    Links the job applied to with the resume used.
    """
    class Status(models.TextChoices):
        SAVED = 'SAVED', 'Saved'
        APPLIED = 'APPLIED', 'Applied'
        SCREENING = 'SCREENING', 'Screening'
        INTERVIEWING = 'INTERVIEWING', 'Interviewing'
        TECHNICAL = 'TECHNICAL', 'Technical Round'
        FINAL = 'FINAL', 'Final Round'
        OFFER = 'OFFER', 'Offer Received'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    
    # Job details
    job_title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    job_url = models.URLField(blank=True)
    job_description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    job_type = models.CharField(max_length=50, blank=True)  # Full-time, Contract, etc.
    
    # Resume used for this application
    resume = models.ForeignKey(
        Resume, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='applications'
    )
    
    # Application status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SAVED)
    
    # Important dates
    applied_date = models.DateField(null=True, blank=True)
    response_date = models.DateField(null=True, blank=True)
    interview_date = models.DateTimeField(null=True, blank=True)
    offer_deadline = models.DateField(null=True, blank=True)
    
    # Notes and tracking
    notes = models.TextField(blank=True)
    contact_person = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    
    # Application metadata stored as JSONB
    metadata = models.JSONField(default=dict, blank=True)
    """
    {
        "interview_rounds": [
            {"date": "2024-01-15", "type": "phone", "notes": "..."},
            {"date": "2024-01-20", "type": "technical", "notes": "..."}
        ],
        "offer_details": {"salary": "150000", "bonus": "10%"},
        "rejection_reason": "...",
        "referral": "John Doe"
    }
    """
    
    # Priority/interest level
    priority = models.IntegerField(default=0)  # 0-5, higher = more interested
    is_favorite = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at', '-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['user', '-updated_at']),
        ]
    
    def __str__(self):
        return f"{self.job_title} at {self.company} ({self.status})"
    
    @property
    def days_since_applied(self):
        if self.applied_date:
            from django.utils import timezone
            return (timezone.now().date() - self.applied_date).days
        return None

