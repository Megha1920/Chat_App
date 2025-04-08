from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Message
from .serializers import MessageSerializer
from django.contrib.auth.models import User
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q 

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.exclude(id=request.user.id)
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
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Message
import traceback
from rest_framework import status
from rest_framework.exceptions import ValidationError

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            receiver_id = request.data.get("receiver")
            text = request.data.get("text")

            if not receiver_id or not text:
                return Response({"error": "Missing receiver or text"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                receiver = User.objects.get(id=receiver_id)
            except User.DoesNotExist:
                return Response({"error": "Receiver not found"}, status=status.HTTP_404_NOT_FOUND)

            message = Message.objects.create(
                sender=request.user,
                receiver=receiver,
                content=text
            )

            return Response({"status": "Message sent"})
        
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)