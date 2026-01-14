"""
URL configuration for the API app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostingViewSet, CandidateViewSet, CritiqueResultViewSet, JobApplicationViewSet

router = DefaultRouter()
router.register(r'jobs', JobPostingViewSet, basename='job')
router.register(r'candidates', CandidateViewSet, basename='candidate')
router.register(r'critiques', CritiqueResultViewSet, basename='critique')
router.register(r'applications', JobApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
]

