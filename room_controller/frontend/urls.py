from django.urls import path
from .views import index


urlpatterns = [
    path('', index),  # render index template whenever there is a blank path, "homepage"
    path('join', index),
    path('create', index),
    path('room/<str:roomCode>', index)  # dynamic url, accept any string
]