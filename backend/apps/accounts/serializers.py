from rest_framework import serializers
from django.contrib.auth.models import User
from apps.accounts.models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    display_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'display_name']

    def create(self, validated_data):
        display_name = validated_data.pop('display_name', validated_data.get('username'))
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        
        # Profile is created by signal or manually? 
        # Looking at previous code, Profile is created manually in seed script.
        # Let's check if there are signals.
        from apps.accounts.models import Profile
        profile, created = Profile.objects.get_or_create(user=user)
        profile.display_name = display_name
        profile.save()

        # Initialize journey
        from apps.journey.utils import initialize_user_journey
        initialize_user_journey(user)
        
        return user

