"""
User accounts models with profile and ground truth storage.
"""

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid


class UserProfile(models.Model):
    """
    Extended user profile storing ground truth information.
    All career data stored as JSONB for flexibility.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Ground truth - the user's actual career information
    # Stored as JSONB for flexible schema
    ground_truth = models.JSONField(default=dict, blank=True)
    """
    Expected ground_truth structure:
    {
        "personal_info": {
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone": "+1-555-0123",
            "location": "San Francisco, CA",
            "linkedin": "linkedin.com/in/johndoe",
            "github": "github.com/johndoe",
            "website": "johndoe.dev"
        },
        "summary": "Experienced software engineer with 8+ years...",
        "experience": [
            {
                "title": "Senior Software Engineer",
                "company": "Tech Corp",
                "location": "San Francisco, CA",
                "start_date": "2020-01",
                "end_date": null,  // null = current
                "description": "Led development of...",
                "achievements": [
                    "Increased system performance by 40%",
                    "Mentored 5 junior developers"
                ]
            }
        ],
        "education": [
            {
                "degree": "B.S. Computer Science",
                "institution": "Stanford University",
                "location": "Stanford, CA",
                "graduation_date": "2016-05",
                "gpa": "3.8",
                "highlights": ["Dean's List", "Honors"]
            }
        ],
        "skills": {
            "technical": ["Python", "JavaScript", "React", "Django", "AWS"],
            "soft": ["Leadership", "Communication", "Problem Solving"],
            "languages": ["English (Native)", "Spanish (Intermediate)"]
        },
        "certifications": [
            {
                "name": "AWS Solutions Architect",
                "issuer": "Amazon Web Services",
                "date": "2023-06",
                "credential_id": "ABC123"
            }
        ],
        "projects": [
            {
                "name": "Open Source Project",
                "description": "A popular library for...",
                "url": "github.com/project",
                "technologies": ["Python", "FastAPI"]
            }
        ]
    }
    """
    
    # User preferences for resume generation
    preferences = models.JSONField(default=dict, blank=True)
    """
    Expected preferences structure:
    {
        "default_template": "modern",
        "preferred_length": "2_pages",
        "include_photo": false,
        "color_scheme": "professional_blue"
    }
    """
    
    # Profile completeness tracking
    is_complete = models.BooleanField(default=False)
    completion_percentage = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile: {self.user.username}"
    
    def calculate_completeness(self):
        """Calculate profile completeness percentage."""
        ground_truth = self.ground_truth or {}
        
        sections = [
            'personal_info',
            'summary',
            'experience',
            'education',
            'skills'
        ]
        
        filled = sum(1 for s in sections if ground_truth.get(s))
        self.completion_percentage = int((filled / len(sections)) * 100)
        self.is_complete = self.completion_percentage == 100
        return self.completion_percentage


# Auto-create profile when user is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
