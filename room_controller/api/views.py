from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.
# endpoints

# api view 
# view all rooms and create rooms
class RoomView(generics.ListAPIView): # sets up view
    queryset = Room.objects.all()   # what to return
    serializer_class = RoomSerializer   # convert to some format to return

# gets room and its details
class GetRoom(APIView): # inherit from APIView
    serializer_class = RoomSerializer   # define class
    lookup_url_kwarg = 'code'   # pass url with code we need

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)   # get what the code is from the url, get info about the url, find parameter in url that matches 'code'
        if code != None: 
            room = Room.objects.filter(code=code) # code is unique so it will always give us one value
            if len(room) > 0:
                data = RoomSerializer(room[0]).data   # serialize the one room and taking the data (python dict)
                data['is_host'] = self.request.session.session_key == room[0].host  # create new is_host a new key in the data, host is the session key of whoevers is the host of the session
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code paramter not found in request'}, status=status.HTTP_400_BAD_REQUEST)

# automatically dispatch to correct method
# shows the creat-room page where the rooms can be created and changed
class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key): # checking if current user does not have session
            self.request.session.create()   # then create a session
        
        serializer = self.serializer_class(data=request.data) # take data and serialize it
        if serializer.is_valid():   # get valid data using valid serializer
            guest_can_pause = serializer.data.get('guest_can_pause') # method with field we want
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            # make sure the current session has the settings for the guest_can_pause and votes_to_skip
            queryset = Room.objects.filter(host=host) # check if any of the rooms have the same host
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip']) # updating and not creating new and saving, need update fields

                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK) #json formatted data with status code
            else: # creating a new room
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
            
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED) #json formatted data with status code

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)