from rest_framework import serializers

from .models import Hostel


class HostelSerializer(serializers.ModelSerializer):
    wardenId = serializers.UUIDField(source="warden_id", allow_null=True, required=False)
    warden = serializers.CharField(source="warden.name", read_only=True, allow_null=True)
    isActive = serializers.BooleanField(source="is_active", read_only=True)

    class Meta:
        model = Hostel
        fields = ("id", "name", "location", "capacity", "wardenId", "warden", "isActive")
