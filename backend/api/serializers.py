"""
Django REST Framework serializers for the API.
Extended with Resume serializers.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import JobPosting, Candidate, CritiqueResult, Resume


class CritiqueResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = CritiqueResult
        fields = [
            'id', 'status', 'task_id', 'overall_score', 'keyword_score',
            'semantic_score', 'result_json', 'error_message', 
            'created_at', 'completed_at'
        ]
        read_only_fields = fields


class CandidateSerializer(serializers.ModelSerializer):
    critique = CritiqueResultSerializer(read_only=True)
    resume_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Candidate
        fields = [
            'id', 'job_posting', 'name', 'email', 'resume_file',
            'resume_url', 'resume_text', 'critique', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'resume_text', 'critique', 'created_at', 'updated_at']
    
    def get_resume_url(self, obj):
        if obj.resume_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.resume_file.url)
            return obj.resume_file.url
        return None


class CandidateListSerializer(serializers.ModelSerializer):
    critique_status = serializers.SerializerMethodField()
    overall_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Candidate
        fields = ['id', 'name', 'email', 'critique_status', 'overall_score', 'created_at']
    
    def get_critique_status(self, obj):
        if hasattr(obj, 'critique'):
            return obj.critique.status
        return None
    
    def get_overall_score(self, obj):
        if hasattr(obj, 'critique') and obj.critique.overall_score:
            return obj.critique.overall_score
        return None


class JobPostingSerializer(serializers.ModelSerializer):
    candidate_count = serializers.ReadOnlyField()
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'company', 'description', 'requirements',
            'candidate_count', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'candidate_count', 'created_at', 'updated_at']


class JobPostingDetailSerializer(JobPostingSerializer):
    candidates = CandidateListSerializer(many=True, read_only=True)
    
    class Meta(JobPostingSerializer.Meta):
        fields = JobPostingSerializer.Meta.fields + ['candidates']


# ===== Resume Serializers =====

class ResumeSerializer(serializers.ModelSerializer):
    """Full resume serializer with all details."""
    
    class Meta:
        model = Resume
        fields = [
            'id', 'title', 'target_job', 'content', 'agent_outputs',
            'match_score', 'status', 'task_id', 'error_message',
            'version', 'is_published', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'content', 'agent_outputs', 'match_score', 'status',
            'task_id', 'error_message', 'created_at', 'updated_at', 'completed_at'
        ]


class ResumeListSerializer(serializers.ModelSerializer):
    """Lightweight resume serializer for list views."""
    
    class Meta:
        model = Resume
        fields = ['id', 'title', 'status', 'match_score', 'version', 'is_published', 'created_at']


class ResumeContentSerializer(serializers.Serializer):
    """Serializer for resume content structure."""
    
    header = serializers.DictField(required=False)
    summary = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.ListField(child=serializers.DictField(), required=False)
    education = serializers.ListField(child=serializers.DictField(), required=False)
    skills = serializers.DictField(required=False)
    certifications = serializers.ListField(child=serializers.DictField(), required=False)
    projects = serializers.ListField(child=serializers.DictField(), required=False)


class GenerateCritiqueSerializer(serializers.Serializer):
    job_id = serializers.UUIDField(required=False)
    
    def validate_job_id(self, value):
        if not JobPosting.objects.filter(id=value).exists():
            raise serializers.ValidationError("Job posting not found.")
        return value
