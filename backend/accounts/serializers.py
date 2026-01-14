"""
Serializers for user accounts and authentication.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with ground truth."""
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'ground_truth', 'preferences', 
            'is_complete', 'completion_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_complete', 'completion_percentage', 'created_at', 'updated_at']
    
    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        instance.calculate_completeness()
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user with nested profile."""
    
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already registered"})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class GroundTruthSerializer(serializers.Serializer):
    """Serializer for ground truth data structure."""
    
    personal_info = serializers.DictField(required=False)
    summary = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.ListField(child=serializers.DictField(), required=False)
    education = serializers.ListField(child=serializers.DictField(), required=False)
    skills = serializers.DictField(required=False)
    certifications = serializers.ListField(child=serializers.DictField(), required=False)
    projects = serializers.ListField(child=serializers.DictField(), required=False)
