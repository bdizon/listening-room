from django.urls import path
from .views import RoomView, CreateRoomView
urlpatterns = [
    path('room', RoomView.as_view()),   # take class and give view
    # path('', main) # cant have functions and classes being views
    path('create-room', CreateRoomView.as_view())
    
]
