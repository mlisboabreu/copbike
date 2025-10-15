from django.urls import path
# Adicionar RankingView na linha de importação
from .views import RideListCreateView, CommunityChallengeListView, RankingView

urlpatterns = [
    path('rides/', RideListCreateView.as_view(), name='ride-list-create'),
    path('challenges/', CommunityChallengeListView.as_view(), name='challenge-list'),
    # NOVO PATH PARA O RANKING
    path('ranking/', RankingView.as_view(), name='ranking-list'),
]

