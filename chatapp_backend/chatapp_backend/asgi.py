from chat.middleware import JWTAuthMiddleware  # 👈 import this

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(  # 👈 use custom middleware
        URLRouter(chat.routing.websocket_urlpatterns)
    ),
})
