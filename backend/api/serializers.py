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