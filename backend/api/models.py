from django.db import models

# Create your models here.
# api/models.py

from django.db import models
from django.contrib.auth.models import User

class Ride(models.Model):
    """
    Representa uma única pedalada feita por um usuário.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rides')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    distance_km = models.FloatField(default=0.0)
    co2_saved_kg = models.FloatField(default=0.0)
    # Para simplicidade, vamos armazenar a rota como um texto.
    # Em produção, um JSONField seria melhor.
    route_points = models.TextField(blank=True)

    def __str__(self):
        return f"Pedalada de {self.user.username} - {self.distance_km:.2f} km"

class CommunityChallenge(models.Model):
    """
    Representa um desafio comunitário que os usuários podem participar.
    """
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    location_name = models.CharField(max_length=255, default="Belém, PA")

    def __str__(self):
        return self.title