from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.api_health, name='api_health'),
    path('check_db/', views.check_db, name='check_db'),
    path('create_superuser/', views.create_superuser, name='create_superuser'),
    path('register/', views.api_register, name='api_register'),
    path('login/', views.api_login, name='api_login'),
]