from django.urls import path
from . import views

urlpatterns = [
    path('api/register/', views.api_register, name='api_register'),
    path('api/login/', views.api_login, name='api_login'),
]