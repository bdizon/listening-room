from django.urls import path
from .views import RoomView, CreateRoomView, GetRoom, JoinRoom, UserInRoom
urlpatterns = [
    path('room', RoomView.as_view()),   # take class and give view, shows the rooms i the DB
    # path('', main) # cant have functions and classes being views
    path('create-room', CreateRoomView.as_view()),  # shows the create-room
    path('get-room', GetRoom.as_view()), # shows the info of the room 
    path('join-room', JoinRoom.as_view()),   # join room view
    path('user-in-room', UserInRoom.as_view()), # shows if user is currently in a room
    
]
