from django.db import models
from django.contrib.auth.models import User

class Week(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    week_number = models.IntegerField()
    title = models.CharField(max_length=200)
    theme = models.CharField(max_length=100, blank=True)
    color_accent = models.CharField(max_length=7, default="#00FF88")
    bonus_awarded = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Week {self.week_number}: {self.title}"

class Day(models.Model):
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('pre_completed', 'Pre-Completed'),
        ('post_completed', 'Post-Completed'),
        ('missed', 'Missed'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    week = models.ForeignKey(Week, on_delete=models.CASCADE, related_name='days')
    day_number = models.IntegerField()
    date = models.DateField(null=True, blank=True)
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    completion_type = models.CharField(
        max_length=20,
        choices=[('normal', 'Normal'), ('pre', 'Pre-Complete'), ('post', 'Post-Complete')],
        default='normal'
    )
    xp_modifier = models.FloatField(default=1.0)
    xp_reward = models.IntegerField(default=100)
    xp_earned = models.IntegerField(default=0)
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Day {self.day_number}: {self.title}"

class Task(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
        ('boss', 'Boss'),
    ]
    day = models.ForeignKey(Day, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    xp_value = models.IntegerField(default=25)
    order = models.IntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

class KnowledgeCheck(models.Model):
    day = models.ForeignKey(Day, on_delete=models.CASCADE, related_name='knowledge_checks')
    question = models.TextField()
    is_answered = models.BooleanField(default=False)
    answer_notes = models.TextField(blank=True)
    order = models.IntegerField(default=0)
