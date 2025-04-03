from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

    def get_response(self):
        response = super().get_response()
        user = self.user  # Get the authenticated user
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        # Modify response to include JWT tokens
        response.data = {
            "refresh": str(refresh),
            "access": str(access_token),
        }
        return response
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response({"error": "Refresh token required"}, status=400)

            # Blacklist the token
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"success": "Logged out successfully"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=400)