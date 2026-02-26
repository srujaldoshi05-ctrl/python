from django.urls import path
from .views import *

urlpatterns = [
    path('https://srujaldoshi05-ctrl.github.io/python/', home, name='home'),
    path('save-score/', save_score, name='save_score'),
    path('get-scores/', get_scores, name='get_scores'),
    path('get-leaderboard/', get_leaderboard, name='get_leaderboard'),
    path('auth-user/', auth_user, name='auth_user'),
    path('change-password/', change_password, name='change_password'),
    path('save-progress/', save_progress, name='save_progress'),
    path('get-progress/', get_progress, name='get_progress'),
]
