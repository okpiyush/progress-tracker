from datetime import date, timedelta

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
    from apps.journey.models import Day
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
