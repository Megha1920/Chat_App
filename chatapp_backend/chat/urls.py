from django.urls import path
from .views import UserListView, ChatHistoryView,SendMessageView

urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
     path('messages/<int:user_id>/', ChatHistoryView.as_view(), name='chat-history'),
     path("messages/send/", SendMessageView.as_view()),
]
