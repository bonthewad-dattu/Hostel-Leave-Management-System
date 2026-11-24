from datetime import date

from django.conf import settings
from rest_framework import serializers

from .models import LeaveRequest


class LeaveInputSerializer(serializers.Serializer):
    leaveType = serializers.CharField(source="leave_type", max_length=60, required=False, default="Personal")
    reason = serializers.CharField(max_length=2000)
    fromDate = serializers.DateField(source="from_date")
    toDate = serializers.DateField(source="to_date")
    parentContact = serializers.CharField(source="parent_contact", max_length=10)
    emergencyContact = serializers.CharField(source="emergency_contact", max_length=10, required=False)
    contactNumber = serializers.CharField(max_length=10, required=False, write_only=True)
    destination = serializers.CharField(max_length=500)

    def validate(self, attrs):
        if not attrs.get("emergency_contact"):
            attrs["emergency_contact"] = attrs.pop("contactNumber", "")
        else:
            attrs.pop("contactNumber", None)
        if not attrs["reason"].strip():
            raise serializers.ValidationError({"reason": "Reason is required."})
        if attrs["from_date"] < date.today():
            raise serializers.ValidationError({"fromDate": "From date cannot be in the past."})
        if attrs["to_date"] < attrs["from_date"]:
            raise serializers.ValidationError({"toDate": "To date cannot be before from date."})
        days = (attrs["to_date"] - attrs["from_date"]).days + 1
        if days > settings.MAX_LEAVE_DAYS:
            raise serializers.ValidationError(
                {"toDate": f"A leave request cannot exceed {settings.MAX_LEAVE_DAYS} days."}
            )
        for field in ("parent_contact", "emergency_contact"):
            if not attrs.get(field):
                raise serializers.ValidationError({field: "A contact number is required."})
            if len(attrs[field]) != 10 or not attrs[field].isdigit() or attrs[field][0] not in "6789":
                raise serializers.ValidationError({field: "Must be a valid 10-digit Indian mobile number."})
        if not attrs["destination"].strip():
            raise serializers.ValidationError({"destination": "Destination is required."})
        return attrs


class LeaveRequestSerializer(serializers.ModelSerializer):
    studentId = serializers.UUIDField(source="student_id")
    studentName = serializers.CharField(source="student.name")
    studentEmail = serializers.EmailField(source="student.email")
    rollNumber = serializers.CharField(source="student.roll_number", allow_null=True)
    hostelBlock = serializers.CharField(source="student.hostel_block", allow_null=True)
    leaveType = serializers.CharField(source="leave_type")
    fromDate = serializers.DateField(source="from_date")
    toDate = serializers.DateField(source="to_date")
    parentContact = serializers.CharField(source="parent_contact")
    emergencyContact = serializers.CharField(source="emergency_contact")
    contactNumber = serializers.CharField(source="emergency_contact")
    submittedAt = serializers.DateTimeField(source="submitted_at")
    updatedAt = serializers.DateTimeField(source="updated_at")
    reviewedAt = serializers.DateTimeField(source="reviewed_at", allow_null=True)
    reviewedBy = serializers.UUIDField(source="reviewed_by_id", allow_null=True)
    status = serializers.CharField(source="get_status_display")

    class Meta:
        model = LeaveRequest
        fields = (
            "id", "studentId", "studentName", "studentEmail", "rollNumber",
            "hostelBlock", "leaveType", "reason", "fromDate", "toDate",
            "parentContact", "emergencyContact", "contactNumber", "destination",
            "status", "submittedAt", "updatedAt", "reviewedAt", "reviewedBy",
        )
