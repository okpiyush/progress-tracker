from rest_framework import viewsets, mixins, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from apps.accounts.serializers import UserSerializer, ProfileSerializer
from apps.accounts.models import Profile

class UserViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def update_me(self, request):
        """Update the authenticated user's profile."""
        profile = request.user.profile
        profile_data = request.data.get('profile', {})
        
        # Update allowed profile fields
        allowed_fields = ['display_name', 'bio', 'avatar_emoji', 'github_url', 'linkedin_url', 'resume_url', 'leetcode_url', 'journey_title']
        for field in allowed_fields:
            if field in profile_data:
                setattr(profile, field, profile_data[field])
        profile.save()
        
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class PublicProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Profile.objects.filter(is_public=True)
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'user__username'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Add journey data
        from apps.journey.models import Day
        days = Day.objects.filter(user=instance.user).order_by('day_number')
        
        journey_data = []
        cumulative_xp = 0
        grid_data = []
        
        for day in days:
            cumulative_xp += day.xp_earned
            grid_data.append({
                "day_number": day.day_number,
                "status": day.status,
                "xp": day.xp_earned,
                "blog_slug": day.blog_entry.slug if hasattr(day, 'blog_entry') and day.blog_entry.status == 'published' else None
            })
            if day.status in ['completed', 'pre_completed', 'post_completed']:
                journey_data.append({
                    "day": f"D{day.day_number}",
                    "xp": cumulative_xp
                })

        data['journey_grid'] = grid_data
        data['xp_history'] = journey_data
        
        # Add published blogs
        from apps.blog.models import BlogEntry
        from apps.blog.serializers import BlogEntrySerializer
        blogs = BlogEntry.objects.filter(
            user=instance.user, 
            status='published', 
            is_public=True
        ).order_by('-published_at')[:5]
        data['recent_blogs'] = BlogEntrySerializer(blogs, many=True).data
        
        return Response(data)
