from django.shortcuts import render
from rest_framework import generics
from .serializers import RoomSerializer
from .models import Room

# Create your views here.
# endpoints

# api view 
# view all rooms and create rooms
class RoomView(generics.ListAPIView): # sets up view
    queryset = Room.objects.all()   # what to return
    serializer_class = RoomSerializer   # convert to some format to return