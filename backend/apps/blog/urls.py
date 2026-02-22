from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.blog.views import BlogEntryViewSet

router = DefaultRouter()
router.register(r'entries', BlogEntryViewSet, basename='entry')

urlpatterns = [
    path('', include(router.urls)),
]
