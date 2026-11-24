from django.urls import path

from . import views

urlpatterns = [
    path("leaves", views.leave_requests, name="leave-requests"),
    path("leaves/<uuid:leave_id>", views.leave_detail, name="leave-detail"),
    path("leaves/<uuid:leave_id>/comments", views.leave_comments, name="leave-comments"),
    path("leaves/<uuid:leave_id>/history", views.leave_history, name="leave-history"),
]
