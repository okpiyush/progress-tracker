import json
import os
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from apps.journey.models import Week, Day, Task, KnowledgeCheck
from django.contrib.auth.models import User
from apps.accounts.models import Profile

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # Look for seed data in the app root
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
        seed_path = os.path.join(base_dir, 'livejourney_seed_data.json')
        
        with open(seed_path) as f:
            data = json.load(f)

        initial_username = os.environ.get('INITIAL_USERNAME', 'piyush')
        initial_password = os.environ.get('INITIAL_PASSWORD', 'password')
        initial_email = os.environ.get('INITIAL_EMAIL', 'piyush@example.com')
        initial_display_name = os.environ.get('INITIAL_DISPLAY_NAME', 'Piyush Kumar')

        user, created = User.objects.get_or_create(username=initial_username, defaults={'email': initial_email})
        if created or not user.has_usable_password():
            user.set_password(initial_password)
            user.save()
            
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.display_name = initial_display_name
        profile.save()

        # Clear existing data for idempotency
        Week.objects.filter(user=user).delete()

        start_date = date.today()

        for week_data in data['weeks']:
            week = Week.objects.create(
                user=user,
                week_number=week_data['week_number'],
                title=week_data['title'],
                theme=week_data.get('theme', ''),
                color_accent=week_data.get('color_accent', '#00FF88'),
            )
            for day_data in week_data.get('days', []):
                day_date = start_date + timedelta(days=day_data['day_number'] - 1)
                day = Day.objects.create(
                    user=user,
                    week=week,
                    day_number=day_data['day_number'],
                    date=day_date,
                    title=day_data['title'],
                    xp_reward=day_data['xp_reward'],
                    status='active' if day_data['day_number'] == 1 else 'upcoming',
                )
                for task_data in day_data.get('tasks', []):
                    Task.objects.create(
                        day=day, 
                        title=task_data['title'],
                        difficulty=task_data.get('difficulty', 'medium'),
                        xp_value=task_data.get('xp_value', 25),
                        order=task_data.get('order', 0)
                    )
                for kc_data in day_data.get('knowledge_checks', []):
                    KnowledgeCheck.objects.create(
                        day=day, 
                        question=kc_data['question'],
                        order=kc_data.get('order', 0)
                    )

        self.stdout.write(self.style.SUCCESS('Journey seeded successfully!'))
