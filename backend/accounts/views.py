"""
Views for user accounts and authentication.
"""

from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.shortcuts import redirect
from django.conf import settings

# OAuth imports
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

from .models import UserProfile
from .serializers import (
    UserSerializer, 
    UserProfileSerializer, 
    RegisterSerializer,
    GroundTruthSerializer
)


class GoogleLogin(SocialLoginView):
    """
    Google OAuth2 login endpoint.
    POST /api/auth/social/google/
    Send: { "code": "..." } or { "access_token": "..." }
    Returns: JWT tokens
    """
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:5173/oauth/callback"
    client_class = OAuth2Client


class GitHubLogin(SocialLoginView):
    """
    GitHub OAuth login endpoint.
    POST /api/auth/social/github/
    Send: { "code": "..." } or { "access_token": "..." }
    Returns: JWT tokens
    """
    adapter_class = GitHubOAuth2Adapter
    callback_url = "http://localhost:5173/oauth/callback"
    client_class = OAuth2Client


class OAuthCallbackView(APIView):
    """
    View to handle OAuth callback and generate JWT tokens.
    This is called after django-allauth completes the OAuth flow.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        user = request.user
        
        if user.is_authenticated:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Redirect to frontend with tokens
            frontend_url = "http://localhost:5173/oauth/callback"
            return redirect(f"{frontend_url}?access={access_token}&refresh={refresh_token}")
        
        # If not authenticated, redirect to login
        return redirect("/login")


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint.
    
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Get or update current authenticated user.
    
    GET /api/auth/me/
    PUT /api/auth/me/
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user profiles.
    
    GET /api/profile/ - Get current user's profile
    PUT /api/profile/ - Update profile
    PATCH /api/profile/ground-truth/ - Update ground truth
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    
    def get_object(self):
        return self.request.user.profile
    
    def list(self, request):
        """Return current user's profile."""
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'], url_path='ground-truth')
    def update_ground_truth(self, request):
        """
        Update only the ground truth data.
        Allows partial updates to specific sections.
        """
        profile = self.get_object()
        
        # Validate incoming data
        serializer = GroundTruthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Merge with existing ground truth
        current_truth = profile.ground_truth or {}
        for key, value in serializer.validated_data.items():
            if value is not None:
                current_truth[key] = value
        
        profile.ground_truth = current_truth
        profile.calculate_completeness()
        profile.save()
        
        return Response({
            'ground_truth': profile.ground_truth,
            'completion_percentage': profile.completion_percentage,
            'is_complete': profile.is_complete
        })
    
    @action(detail=False, methods=['get'], url_path='completeness')
    def get_completeness(self, request):
        """Get profile completeness status."""
        profile = self.get_object()
        profile.calculate_completeness()
        
        return Response({
            'completion_percentage': profile.completion_percentage,
            'is_complete': profile.is_complete,
            'missing_sections': self._get_missing_sections(profile)
        })
    
    def _get_missing_sections(self, profile):
        """Identify missing sections in ground truth."""
        ground_truth = profile.ground_truth or {}
        required_sections = ['personal_info', 'summary', 'experience', 'education', 'skills']
        return [s for s in required_sections if not ground_truth.get(s)]


class LogoutView(generics.GenericAPIView):
    """
    Logout by blacklisting the refresh token.
    
    POST /api/auth/logout/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
