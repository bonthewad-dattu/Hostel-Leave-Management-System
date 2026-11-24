import uuid

from django.conf import settings
from django.db import models


class LeaveRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_REVIEW = "in_review", "In Review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="leave_requests"
    )
    leave_type = models.CharField(max_length=60, default="Personal")
    reason = models.TextField(max_length=2000)
    from_date = models.DateField()
    to_date = models.DateField()
    parent_contact = models.CharField(max_length=10)
    emergency_contact = models.CharField(max_length=10)
    destination = models.CharField(max_length=500)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.PENDING
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_leave_requests",
    )

    class Meta:
        ordering = ["-submitted_at"]
        indexes = [
            models.Index(fields=["student", "-submitted_at"]),
            models.Index(fields=["status", "from_date", "to_date"]),
        ]


class ReviewComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    leave = models.ForeignKey(
        LeaveRequest, on_delete=models.CASCADE, related_name="comments"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="leave_comments",
    )
    author_name = models.CharField(max_length=120)
    message = models.CharField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class LeaveHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    leave = models.ForeignKey(
        LeaveRequest, on_delete=models.CASCADE, related_name="history"
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="leave_status_changes",
    )
    old_status = models.CharField(max_length=16, null=True, blank=True)
    new_status = models.CharField(max_length=16, choices=LeaveRequest.Status.choices)
    note = models.CharField(max_length=2000, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
