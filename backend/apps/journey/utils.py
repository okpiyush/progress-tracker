import json
import os
from datetime import date, timedelta
from django.conf import settings

XP_PER_LEVEL = [0, 500, 1200, 2200, 3500, 5000, 7000, 9500, 12500, 16000, 20000]

def calculate_level(total_xp: int) -> tuple[int, int, int]:
    """Returns (level, xp_in_current_level, xp_needed_for_next_level)"""
    level = 1
    for i in range(1, len(XP_PER_LEVEL)):
        if total_xp >= XP_PER_LEVEL[i]:
            level = i + 1
        else:
            break
            
    if level < len(XP_PER_LEVEL):
        base_xp = XP_PER_LEVEL[level - 1]
        xp_needed = XP_PER_LEVEL[level] - base_xp
        xp_in_current = total_xp - base_xp
        return level, xp_in_current, xp_needed
    else:
        extra_xp = total_xp - XP_PER_LEVEL[-1]
        extra_levels = extra_xp // 4000
        level = 10 + extra_levels
        xp_in_current = extra_xp % 4000
        xp_needed = 4000
        return level, xp_in_current, xp_needed

def calculate_streak_multiplier(streak: int) -> float:
    return min(1.0 + (streak * 0.1), 2.0)

def award_xp(user, xp_amount):
    from apps.accounts.models import Profile
    profile = Profile.objects.get(user=user)
    old_level = profile.current_level
    profile.total_xp += xp_amount
    new_level, _, _ = calculate_level(profile.total_xp)
    leveled_up = new_level > old_level
    profile.current_level = new_level
    profile.save()
    return leveled_up, new_level

def update_streak(user):
    from apps.accounts.models import Profile
    profile = Profile.objects.get(user=user)
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    if profile.last_active_date == yesterday:
        profile.current_streak += 1
    elif profile.last_active_date != today:
        profile.current_streak = 1
        
    profile.last_active_date = today
    if profile.current_streak > profile.longest_streak:
        profile.longest_streak = profile.current_streak
    profile.save()

def initialize_user_journey(user):
    from apps.journey.models import Week, Day, Task, KnowledgeCheck
    seed_path = os.path.join(settings.BASE_DIR, 'livejourney_seed_data.json')
    
    if not os.path.exists(seed_path):
        return

    with open(seed_path) as f:
        data = json.load(f)

    start_date = date.today()
    
    # Check if already seeded
    if Week.objects.filter(user=user).exists():
        return

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

