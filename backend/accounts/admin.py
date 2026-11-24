from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    ordering = ("email",)
    list_display = ("email", "name", "role", "is_active", "is_staff")
    search_fields = ("email", "name", "roll_number", "hostel_block")
    fields = (
        "email", "name", "role", "roll_number", "hostel_block",
        "is_active", "is_staff", "is_superuser", "created_at", "updated_at",
    )
    readonly_fields = ("created_at", "updated_at")
