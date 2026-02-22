from rest_framework import serializers
from apps.blog.models import BlogEntry

class BlogEntrySerializer(serializers.ModelSerializer):
    day_number = serializers.SerializerMethodField()

    class Meta:
        model = BlogEntry
        fields = '__all__'
        read_only_fields = ['user', 'content_html', 'slug', 'views', 'published_at', 'status']

    def get_day_number(self, obj):
        return obj.day.day_number if obj.day else None
