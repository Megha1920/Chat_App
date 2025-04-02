from django.contrib import admin
from django.urls import path, include
from .views import GoogleLogin  # Import your Google login view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),

    # Auth endpoints
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),

    # ✅ Add Google login manually
    path('auth/social/google/', GoogleLogin.as_view(), name='google_login'),
]
