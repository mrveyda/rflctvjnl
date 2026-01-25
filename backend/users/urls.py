from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.api_health, name='api_health'),
    path('register/', views.api_register, name='api_register'),
    path('login/', views.api_login, name='api_login'),
]