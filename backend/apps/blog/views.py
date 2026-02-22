from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models
from apps.blog.models import BlogEntry
from apps.blog.serializers import BlogEntrySerializer
from apps.journey.utils import award_xp

class BlogEntryViewSet(viewsets.ModelViewSet):
    serializer_class = BlogEntrySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if self.action in ['list', 'retrieve']:
            if user.is_authenticated:
                return BlogEntry.objects.filter(models.Q(user=user) | models.Q(is_public=True, status='published'))
            return BlogEntry.objects.filter(is_public=True, status='published')
            
        if user.is_authenticated:
            return BlogEntry.objects.filter(user=user)
        return BlogEntry.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def publish(self, request, slug=None):
        entry = self.get_object()
        if entry.user != request.user:
            return Response(status=403)
        
        if entry.status != 'published':
            entry.status = 'published'
            entry.published_at = timezone.now()
            entry.save()
            award_xp(request.user, 50)
            
        return Response(self.get_serializer(entry).data)
