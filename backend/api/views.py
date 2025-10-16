from rest_framework import generics, permissions
from .models import Ride, CommunityChallenge
# Adicionar ProfileSerializer na linha de importação
from .serializers import RideSerializer, CommunityChallengeSerializer, RankingSerializer, ProfileSerializer
from django.db.models import Sum, Count
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response

# ... classes de View existentes (RideListCreateView, CommunityChallengeListView, RankingView) ...
class RideListCreateView(generics.ListCreateAPIView):
    queryset = Ride.objects.all().order_by('-start_time')
    serializer_class = RideSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CommunityChallengeListView(generics.ListAPIView):
    queryset = CommunityChallenge.objects.all().order_by('start_date')
    serializer_class = CommunityChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

class RankingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        ranking_data = User.objects.annotate(
            total_distance_km=Sum('rides__distance_km')
        ).filter(
            total_distance_km__isnull=False
        ).order_by(
            '-total_distance_km'
        ).values(
            'id', 'username', 'total_distance_km'
        )
        formatted_data = [
            {'user_id': item['id'], 'username': item['username'], 'total_distance_km': item['total_distance_km']}
            for item in ranking_data
        ]
        serializer = RankingSerializer(formatted_data, many=True)
        return Response(serializer.data)


# NOVA VIEW PARA O PERFIL DO UTILIZADOR
class ProfileView(APIView):
    """
    View para buscar os dados agregados e o histórico de pedaladas
    do utilizador autenticado.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Calcula as estatísticas totais do utilizador
        stats = user.rides.aggregate(
            total_distance_km=Sum('distance_km'),
            total_co2_saved_kg=Sum('co2_saved_kg')
        )

        # Adiciona os totais calculados ao objeto do utilizador para o serializer
        # O 'or 0.0' garante que o valor seja 0 se o utilizador ainda não tiver pedaladas
        user.total_distance_km = stats['total_distance_km'] or 0.0
        user.total_co2_saved_kg = stats['total_co2_saved_kg'] or 0.0
        
        # O serializer agora pode aceder a `user.rides`, `user.total_distance_km`, etc.
        serializer = ProfileSerializer(user)
        return Response(serializer.data)

