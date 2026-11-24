from rest_framework import serializers

from hostels.utils import find_active_hostel

from .models import User


class PublicUserSerializer(serializers.ModelSerializer):
    rollNumber = serializers.CharField(source="roll_number", allow_null=True)
    hostelBlock = serializers.CharField(source="hostel_block", allow_null=True)
    phoneNumber = serializers.CharField(source="phone_number", allow_blank=True)
    createdAt = serializers.DateTimeField(source="created_at")
    active = serializers.BooleanField(source="is_active", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "email",
            "role",
            "rollNumber",
            "hostelBlock",
            "phoneNumber",
            "createdAt",
            "active",
        )


class StudentProfileSerializer(PublicUserSerializer):
    assignedWarden = serializers.SerializerMethodField()

    class Meta(PublicUserSerializer.Meta):
        fields = PublicUserSerializer.Meta.fields + ("assignedWarden",)

    def get_assignedWarden(self, user):
        if user.role != User.Role.STUDENT:
            return None
        hostel = find_active_hostel(user.hostel_block)
        if not hostel or not hostel.warden:
            return None
        return {"name": hostel.warden.name, "email": hostel.warden.email}
