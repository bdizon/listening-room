from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room
# Create your views here.

# Request authorization
# return a url to authenticate spotify application
# use in front end
# just generating url
class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        # request authorization
        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',  # requesting a code that allow us to authenticate a user
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,

        }).prepare().url    # generate a url

        return Response({'url': url}, status=status.HTTP_200_OK)

# get info from response from above url (from the redirect url, it automatically invokes this function)
# get access token
def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    # send a request back to get access code and refresh code
    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    #create session key for the user
    if not request.session.exists(request.session.session_key):
        request.session.create()

    # store tokens
    update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:') # to diff webpage original app, spotify callback

# view to tell us if we are authenticated, need jason so frontend can understand
# endpoint to check if user is authenticated
class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)

# return info about current songs
class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        # need host info to get info about song
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "player/currently-playing"

        # send request to spotify
        response = execute_spotify_api_request(host, endpoint) # get request
        # print(response)

        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url') # get largest image's url
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ""

        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name

        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': 0,
            'id': song_id
        }
        # song is custon object to send to the frontend
        return Response(song, status=status.HTTP_200_OK)

# pause song
class PauseSong(APIView):
    def put(self, response, format=None):
        # check if user has permission
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        # check if the current user is the host/owner of the room or user is has been given the privilege
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)

# play song
class PlaySong(APIView):
    def put(self, response, format=None):
        # check if user has permission
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        # check if the current user is the host/owner of the room or user is has been given the privilege
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)