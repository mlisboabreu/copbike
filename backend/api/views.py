from rest_framework import generics, permissions
from .models import Ride, CommunityChallenge
from .serializers import RideSerializer, CommunityChallengeSerializer, RankingSerializer
from django.db.models import Sum
from django.contrib.auth.models import User
# A CORREÇÃO ESTÁ AQUI: Adicionamos a importação de APIView e Response
from rest_framework.views import APIView
from rest_framework.response import Response

class RideListCreateView(generics.ListCreateAPIView):
    """
    View para listar todas as pedaladas ou criar uma nova.
    """
    queryset = Ride.objects.all().order_by('-start_time')
    serializer_class = RideSerializer
    permission_classes = [permissions.IsAuthenticated] # Apenas utilizadores logados podem criar

    def perform_create(self, serializer):
        # Associa o utilizador logado à pedalada criada
        serializer.save(user=self.request.user)

class CommunityChallengeListView(generics.ListAPIView):
    """
    View para listar todos os desafios comunitários.
    """
    queryset = CommunityChallenge.objects.all().order_by('start_date')
    serializer_class = CommunityChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]


class RankingView(APIView):
    """
    View para calcular e retornar o ranking dos utilizadores
    baseado na distância total percorrida.
    """
    permission_classes = [permissions.IsAuthenticated] # Apenas utilizadores logados podem ver o ranking

    def get(self, request, *args, **kwargs):
        # Agrupa as pedaladas por utilizador, soma a distância e ordena
        ranking_data = User.objects.annotate(
            total_distance_km=Sum('rides__distance_km')
        ).filter(
            total_distance_km__isnull=False  # Garante que apenas utilizadores com pedaladas apareçam
        ).order_by(
            '-total_distance_km' # Ordena do maior para o menor
        ).values(
            'id', 'username', 'total_distance_km'
        )

        # Renomeia o campo 'id' para 'user_id' para corresponder ao serializer
        # e formata a saída
        formatted_data = [
            {'user_id': item['id'], 'username': item['username'], 'total_distance_km': item['total_distance_km']}
            for item in ranking_data
        ]
        
        serializer = RankingSerializer(formatted_data, many=True)
        return Response(serializer.data)
