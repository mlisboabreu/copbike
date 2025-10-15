# api/serializers.py

from rest_framework import serializers
from .models import Ride, CommunityChallenge
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RideSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Ride
        fields = ['id', 'user', 'start_time', 'end_time', 'distance_km', 'co2_saved_kg', 'route_points']

class CommunityChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityChallenge
        fields = ['id', 'title', 'description', 'start_date', 'end_date', 'location_name']

class RankingSerializer(serializers.Serializer):
    """
    Serializer para formatar os dados do ranking de utilizadores.
    Não está ligado a um modelo específico, por isso usamos o Serializer base.
    """
    user_id = serializers.IntegerField()
    username = serializers.CharField(max_length=150)
    total_distance_km = serializers.FloatField()

    class Meta:
        fields = ['user_id', 'username', 'total_distance_km']