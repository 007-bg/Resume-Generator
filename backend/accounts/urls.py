"""
URL configuration for accounts app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    CurrentUserView,
    UserProfileViewSet,
    LogoutView,
    GoogleLogin,
    GitHubLogin,
    OAuthCallbackView,
)

router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='profile')

urlpatterns = [
    # JWT Token endpoints (for token refresh)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # OAuth Social Login endpoints (JWT-based)
    path('social/google/', GoogleLogin.as_view(), name='google_login'),
    path('social/github/', GitHubLogin.as_view(), name='github_login'),
    path('oauth/callback/', OAuthCallbackView.as_view(), name='oauth_callback'),
    
    # User endpoints
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Social authentication (django-allauth redirect flow)
    path('social/', include('allauth.socialaccount.urls')),
    
    # Profile management
    path('', include(router.urls)),
]
