from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .forms import RegisterForm

@api_view(['GET'])
def api_health(request):
    return Response({"status": "ok", "message": "Backend is running"})

@api_view(['POST'])
def api_register(request):
    form = RegisterForm(request.data)
    if form.is_valid():
        user = form.save()
        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
    return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        return Response({'message': 'Logged in successfully'})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)