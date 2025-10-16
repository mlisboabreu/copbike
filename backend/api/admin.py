from django.contrib import admin

from .models import Ride, CommunityChallenge

# Estes comandos registam os nossos modelos no painel de administração do Django,
# tornando-os fáceis de gerir através da interface web.

admin.site.register(Ride)
admin.site.register(CommunityChallenge)
