from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import update_or_create_user_tokens, is_spotify_authenticated
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

# get info from response from above url
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



    
