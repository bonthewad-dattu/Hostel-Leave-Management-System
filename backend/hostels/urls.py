from django.urls import path

from . import views

urlpatterns = [
    path("hostels/options", views.active_hostel_options, name="active-hostel-options"),
    path("hostels", views.hostels, name="hostels"),
    path("hostels/<uuid:hostel_id>/reactivate", views.reactivate_hostel, name="hostel-reactivate"),
    path("hostels/<uuid:hostel_id>", views.hostel_detail, name="hostel-detail"),
]
