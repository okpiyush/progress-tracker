from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from apps.accounts.views import UserViewSet, PublicProfileViewSet

route_public = DefaultRouter()
route_public.register(r'profiles', PublicProfileViewSet, basename='public-profile')

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('me/', UserViewSet.as_view({'get': 'me', 'patch': 'update_me'}), name='user_me'),
    path('public/', include(route_public.urls)),
    path('public/profiles/<str:user__username>/', PublicProfileViewSet.as_view({'get': 'retrieve'}), name='public-profile-by-username'),
]
