from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Message
from .serializers import MessageSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q 
from django.contrib.auth import get_user_model

User = get_user_model()

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(is_superuser=False).exclude(id=request.user.id)
        data = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
            for user in users
        ]
        return Response(data)

class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        messages = Message.objects.filter(
            (Q(sender=request.user) & Q(receiver__id=user_id)) |
            (Q(sender__id=user_id) & Q(receiver=request.user))
        )
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
