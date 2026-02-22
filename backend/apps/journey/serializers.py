from rest_framework import serializers
from apps.journey.models import Week, Day, Task, KnowledgeCheck

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['is_completed', 'completed_at', 'xp_value']

class KnowledgeCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeCheck
        fields = '__all__'

class DaySerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    knowledge_checks = KnowledgeCheckSerializer(many=True, read_only=True)
    blog_slug = serializers.SerializerMethodField()
    
    class Meta:
        model = Day
        fields = '__all__'
        read_only_fields = ['status', 'completion_type', 'xp_modifier', 'xp_earned', 'completed_at', 'xp_reward']

    def get_blog_slug(self, obj):
        if hasattr(obj, 'blog_entry') and obj.blog_entry:
            return obj.blog_entry.slug
        return None

class WeekSerializer(serializers.ModelSerializer):
    days = DaySerializer(many=True, read_only=True)
    
    class Meta:
        model = Week
        fields = '__all__'
