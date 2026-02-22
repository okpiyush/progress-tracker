from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import date, timedelta
from apps.journey.models import Week, Day, Task, KnowledgeCheck
from apps.journey.serializers import WeekSerializer, DaySerializer, TaskSerializer, KnowledgeCheckSerializer
from apps.journey.utils import award_xp

class WeekViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WeekSerializer

    def get_queryset(self):
        return Week.objects.filter(user=self.request.user).prefetch_related('days__tasks')

class DayViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DaySerializer

    def get_queryset(self):
        return Day.objects.filter(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        day = self.get_object()
        if day.status in ['completed', 'pre_completed', 'post_completed']:
            return Response({"message": "Day already finalized"}, status=200)
            
        day.status = 'completed'
        day.completed_at = timezone.now()
        day.xp_earned = day.xp_reward
        day.save()
        
        # Update streak
        from apps.journey.utils import update_streak
        update_streak(request.user)
        
        leveled_up, new_level = award_xp(request.user, day.xp_earned)
        
        # Perfect week bonus
        week = day.week
        days_in_week = week.days.count()
        completed_in_week = week.days.filter(status__in=['completed', 'pre_completed', 'post_completed']).count()
        
        perfect_week = False
        if days_in_week == 7 and completed_in_week == 7 and not week.bonus_awarded:
            perfect_week = True
            week.bonus_awarded = True
            week.save()
            award_xp(request.user, 500)
            
        return Response({
            "day": DaySerializer(day).data,
            "leveled_up": leveled_up,
            "new_level": new_level,
            "xp_earned_total": day.xp_earned,
            "perfect_week": perfect_week
        })

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(day__user=self.request.user)

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied, ValidationError
        day = serializer.validated_data.get('day')
        if day.user != self.request.user:
            raise PermissionDenied("Cannot add task to this day.")
        if day.status in ['completed', 'pre_completed', 'post_completed']:
            raise ValidationError("Cannot implicitly add tasks to a finalized day.")
            
        difficulty = serializer.validated_data.get('difficulty', 'medium')
        xp_map = {'easy': 10, 'medium': 25, 'hard': 50, 'boss': 100}
        serializer.save(xp_value=xp_map.get(difficulty, 25))

    def perform_update(self, serializer):
        from rest_framework.exceptions import ValidationError
        instance = self.get_object()
        if instance.day.status in ['completed', 'pre_completed', 'post_completed']:
            raise ValidationError("Cannot modify tasks on a finalized day.")
            
        difficulty = serializer.validated_data.get('difficulty', instance.difficulty)
        xp_map = {'easy': 10, 'medium': 25, 'hard': 50, 'boss': 100}
        serializer.save(xp_value=xp_map.get(difficulty, 25))

    def perform_destroy(self, instance):
        from rest_framework.exceptions import ValidationError
        if instance.day.status in ['completed', 'pre_completed', 'post_completed']:
            raise ValidationError("Cannot delete tasks on a finalized day.")
        instance.delete()

    @action(detail=True, methods=['patch'])
    def toggle(self, request, pk=None):
        task = self.get_object()
        
        if task.is_completed:
            return Response({"error": "Task protocol already executed. Cannot be un-done."}, status=400)

        if task.day.status in ['completed', 'pre_completed', 'post_completed']:
            return Response({"error": "Cannot modify tasks on a finalized day."}, status=400)
            
        task.is_completed = True
        task.completed_at = timezone.now()
        task.save()
        
        leveled_up, new_level = award_xp(request.user, task.xp_value)
            
        return Response({
            "task": TaskSerializer(task).data,
            "leveled_up": leveled_up,
            "new_level": new_level,
            "xp_gained": task.xp_value
        })

class PreCompleteView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, pk):
        try:
            tomorrow_day = Day.objects.get(pk=pk, user=request.user)
            
            if tomorrow_day.status in ['completed', 'pre_completed', 'post_completed']:
                return Response({"error": "Day is already finalized."}, status=400)
                
            today_date = date.today()
            today_day = Day.objects.filter(user=request.user, date=today_date).first()
            
            if today_day:
                today_completion = today_day.tasks.filter(is_completed=True).count()
                today_total = today_day.tasks.count()
                if today_total > 0 and (today_completion / today_total) < 0.5:
                    return Response({"error": "Complete at least 50% of today's tasks before pre-completing tomorrow."}, status=400)

            if tomorrow_day.date != today_date + timedelta(days=1):
                return Response({"error": "Can only pre-complete the next day."}, status=400)

            tomorrow_day.status = 'pre_completed'
            tomorrow_day.completion_type = 'pre'
            tomorrow_day.xp_modifier = 1.0
            tomorrow_day.xp_earned = int(tomorrow_day.xp_reward * 1.0)
            tomorrow_day.completed_at = timezone.now()
            tomorrow_day.save()

            award_xp(request.user, tomorrow_day.xp_earned)
            return Response(DaySerializer(tomorrow_day).data)
        except Day.DoesNotExist:
            return Response(status=404)

class PostCompleteView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, pk):
        try:
            missed_day = Day.objects.get(pk=pk, user=request.user)
            
            if missed_day.status in ['completed', 'pre_completed', 'post_completed']:
                return Response({"error": "Day is already finalized."}, status=400)
                
            today_date = date.today()

            if missed_day.date != today_date - timedelta(days=1):
                return Response({"error": "Can only post-complete the previous day."}, status=400)

            missed_day.status = 'post_completed'
            missed_day.completion_type = 'post'
            missed_day.xp_modifier = 0.75
            missed_day.xp_earned = int(missed_day.xp_reward * 0.75)
            missed_day.completed_at = timezone.now()
            missed_day.save()

            award_xp(request.user, missed_day.xp_earned)
            return Response(DaySerializer(missed_day).data)
        except Day.DoesNotExist:
            return Response(status=404)

class KnowledgeCheckViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = KnowledgeCheckSerializer

    def get_queryset(self):
        return KnowledgeCheck.objects.filter(day__user=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.day.status in ['completed', 'pre_completed', 'post_completed']:
            # Still allow saving content for record-keeping, but block XP
            serializer.save()
            return

        was_answered = instance.is_answered
        is_answered = serializer.validated_data.get('is_answered', was_answered)
        
        serializer.save()
        
        if is_answered and not was_answered:
            award_xp(self.request.user, 15)

class JourneyStatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from apps.accounts.models import Profile
        profile = Profile.objects.get(user=request.user)
        from apps.journey.utils import calculate_level
        level, xp_in_current, xp_needed_for_next_level = calculate_level(profile.total_xp)
        
        days_completed = Day.objects.filter(user=request.user, status__in=['completed', 'pre_completed', 'post_completed']).count()
        total_days = Day.objects.filter(user=request.user).count()
        
        # Get last 7 days for the chart
        today = date.today()
        week_ago = today - timedelta(days=6)
        daily_xp = []
        for i in range(7):
            d = week_ago + timedelta(days=i)
            day_obj = Day.objects.filter(user=request.user, date=d).first()
            daily_xp.append({
                "date": d.isoformat(),
                "day_name": d.strftime('%a').upper(),
                "xp": day_obj.xp_earned if day_obj else 0
            })

        return Response({
            "total_xp": profile.total_xp,
            "level": level,
            "xp_in_current": xp_in_current,
            "xp_needed": xp_needed_for_next_level,
            "streak": profile.current_streak,
            "days_completed": days_completed,
            "total_days": total_days,
            "percent_complete": int(days_completed / total_days * 100) if total_days > 0 else 0,
            "daily_xp": daily_xp
        })
