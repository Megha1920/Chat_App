from django.contrib import admin
from django.urls import path, include
from .views import GoogleLogin,LogoutView  # Import your Google login view
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework_simplejwt.views import TokenBlacklistView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/social/google/', GoogleLogin.as_view(), name='google_login'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path("auth/token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path('chat/',include('chat.urls'))
]
