from django.urls import path
from .views import AuthURL, spotify_callback, IsAuthenticated

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),  # render index template whenever there is a blank path, "homepage"
    path('redirect', spotify_callback), # hit function, redirect to diff view (original app webpage)
    path('is-authenticated', IsAuthenticated.as_view()), # endpoint to IsAuthenticated
]