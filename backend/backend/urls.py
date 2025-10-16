# copbike_project/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Nossas URLs da API
    path('api/', include('api.urls')),
    # URLs de autenticação (login, logout)
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')), # ADICIONE ESTA LINHA
]