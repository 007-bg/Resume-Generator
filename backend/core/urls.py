"""
URL configuration for Resume Critique Agent.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include('api.urls')),
    path('api/auth/', include('accounts.urls')),
    path('api/agents/', include('agents.urls')),
    
    # Social auth callback URLs
    path('accounts/', include('allauth.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all for React SPA routing - must be last
urlpatterns += [
    re_path(r'^(?!api|admin|static|media|accounts).*$', TemplateView.as_view(template_name='index.html')),
]
