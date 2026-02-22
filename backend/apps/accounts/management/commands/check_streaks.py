from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from apps.accounts.models import Profile

class Command(BaseCommand):
    help = 'Reset streaks for users who missed a day'

    def handle(self, *args, **options):
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        # Find profiles where last_active_date is not today or yesterday
        # Actually, if last_active_date < yesterday, the streak is broken.
        profiles = Profile.objects.filter(last_active_date__lt=yesterday)
        count = 0
        for profile in profiles:
            if profile.current_streak > 0:
                profile.current_streak = 0
                profile.save()
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully reset streaks for {count} users'))
