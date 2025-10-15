from django.shortcuts import render

# Create your views here.
# api/views.py

from rest_framework import generics, permissions
from .models import Ride, CommunityChallenge
from .serializers import RideSerializer, CommunityChallengeSerializer

# permissions.IsAuthenticatedOrReadOnly permite que qualquer um veja os dados,
# mas apenas usuários logados podem criar/editar.
# Vamos ajustar isso depois para regras mais específicas.

class RideListCreateView(generics.ListCreateAPIView):
    """
    View para listar todas as pedaladas ou criar uma nova.
    A lista é apenas para debug, depois vamos filtrar por usuário.
    """
    queryset = Ride.objects.all().order_by('-start_time')
    serializer_class = RideSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Associa o usuário logado à pedalada criada
        serializer.save(user=self.request.user)

class CommunityChallengeListView(generics.ListAPIView):
    """
    View para listar todos os desafios comunitários.
    """
    queryset = CommunityChallenge.objects.all().order_by('start_date')
    serializer_class = CommunityChallengeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]