from dj_rest_auth.serializers import UserDetailsSerializer
from allauth.socialaccount.models import SocialAccount
from rest_framework import serializers

class CustomUserSerializer(UserDetailsSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta(UserDetailsSerializer.Meta):
        fields = UserDetailsSerializer.Meta.fields + ('profile_picture',)

    def get_profile_picture(self, obj):
        try:
            social_account = SocialAccount.objects.get(user=obj, provider='google')
            return social_account.extra_data.get('picture')  # Google provides profile picture under 'picture'
        except SocialAccount.DoesNotExist:
            return None  # No social account, return None
