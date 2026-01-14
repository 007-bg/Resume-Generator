from django.contrib import admin
from .models import JobPosting, Candidate, CritiqueResult


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'candidate_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'company', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'job_posting', 'created_at']
    list_filter = ['job_posting', 'created_at']
    search_fields = ['name', 'email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'resume_text']


@admin.register(CritiqueResult)
class CritiqueResultAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'status', 'overall_score', 'created_at', 'completed_at']
    list_filter = ['status', 'created_at']
    search_fields = ['candidate__name', 'task_id']
    readonly_fields = ['id', 'task_id', 'created_at', 'completed_at']
