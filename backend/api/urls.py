# api/urls.py

from django.urls import path
from .views import RideListCreateView, CommunityChallengeListView

urlpatterns = [
    path('rides/', RideListCreateView.as_view(), name='ride-list-create'),
    path('challenges/', CommunityChallengeListView.as_view(), name='challenge-list'),
]