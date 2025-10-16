from django.urls import path
# Adicione ProfileView na linha de importação
from .views import RideListCreateView, CommunityChallengeListView, RankingView, ProfileView

urlpatterns = [
    path('rides/', RideListCreateView.as_view(), name='ride-list-create'),
    path('challenges/', CommunityChallengeListView.as_view(), name='challenge-list'),
    path('ranking/', RankingView.as_view(), name='ranking-list'),
    # NOVO PATH PARA O PERFIL
    path('profile/', ProfileView.as_view(), name='user-profile'),
]

