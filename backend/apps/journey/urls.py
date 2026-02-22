from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.journey.views import WeekViewSet, DayViewSet, TaskViewSet, KnowledgeCheckViewSet, PreCompleteView, PostCompleteView, JourneyStatsView

router = DefaultRouter()
router.register(r'weeks', WeekViewSet, basename='week')
router.register(r'days', DayViewSet, basename='day')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'knowledge-checks', KnowledgeCheckViewSet, basename='knowledge-check')

urlpatterns = [
    path('', include(router.urls)),
    path('days/<int:pk>/pre-complete/', PreCompleteView.as_view(), name='day-pre-complete'),
    path('days/<int:pk>/post-complete/', PostCompleteView.as_view(), name='day-post-complete'),
    path('stats/', JourneyStatsView.as_view(), name='journey-stats'),
]
