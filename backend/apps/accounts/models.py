from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=100, default="Developer")
    avatar_emoji = models.CharField(max_length=10, default="👨‍💻")
    bio = models.TextField(blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    resume_url = models.URLField(blank=True)
    leetcode_url = models.URLField(blank=True)
    journey_title = models.CharField(max_length=200, default="60-Day Comeback Roadmap")
    journey_start_date = models.DateField(null=True, blank=True)
    is_public = models.BooleanField(default=True)
    total_xp = models.IntegerField(default=0)
    current_level = models.IntegerField(default=1)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.display_name
