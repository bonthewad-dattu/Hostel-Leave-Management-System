from collections import Counter

from django.db.models import Count, Q
from rest_framework.decorators import api_view
from rest_framework.response import Response

from accounts.models import User
from hostels.models import Hostel
from leaves.models import LeaveRequest
from leaves.serializers import LeaveRequestSerializer


@api_view(["GET"])
def summary(request):
    user = request.user
    queryset = LeaveRequest.objects.select_related("student", "reviewed_by")
    if user.role == User.Role.STUDENT:
        queryset = queryset.filter(student=user)
    elif user.role == User.Role.WARDEN:
        assigned_blocks = list(
            Hostel.objects.filter(warden=user, is_active=True).values_list("name", flat=True)
        )
        blocks = ([user.hostel_block] if user.hostel_block else []) + assigned_blocks
        if not blocks:
            queryset = queryset.none()
        scope = Q()
        for block in blocks:
            scope |= Q(student__hostel_block__iexact=block)
        if blocks:
            queryset = queryset.filter(scope)
    elif user.role != User.Role.ADMIN:
        return Response({"error": "You do not have permission to view this dashboard."}, status=403)

    counts = {
        row["status"]: row["count"]
        for row in queryset.values("status").annotate(count=Count("id"))
    }
    response_data = {
        "totalRequests": sum(counts.values()),
        "pending": counts.get("pending", 0),
        "inReview": counts.get("in_review", 0),
        "approved": counts.get("approved", 0),
        "rejected": counts.get("rejected", 0),
        "cancelled": counts.get("cancelled", 0),
        "recentRequests": LeaveRequestSerializer(queryset.order_by("-submitted_at")[:5], many=True).data,
    }

    if user.role == User.Role.ADMIN:
        hostels = []
        total_leave_requests = queryset.count()
        for hostel in Hostel.objects.filter(is_active=True).order_by("name"):
            students = User.objects.filter(
                role=User.Role.STUDENT,
                is_active=True,
                hostel_block__iexact=hostel.name,
            )
            student_count = students.count()
            hostel_leave_requests = queryset.filter(student__in=students).count()
            active_leave_requests = queryset.filter(
                student__in=students,
            ).exclude(status__in=["cancelled", "rejected"]).count()
            hostels.append({
                "id": str(hostel.id),
                "hostelBlock": hostel.name,
                "students": student_count,
                "capacity": hostel.capacity,
                "occupancyPercent": round(student_count * 100 / hostel.capacity),
                "leaveRequestPercent": round(
                    hostel_leave_requests * 100 / total_leave_requests, 1
                ) if total_leave_requests else 0,
                "activeLeaveRequests": active_leave_requests,
            })

        frequencies = Counter(
            queryset.filter(student__role=User.Role.STUDENT)
            .values_list("student_id", flat=True)
        )
        users = {
            str(student.id): student
            for student in User.objects.filter(id__in=frequencies.keys())
        }
        response_data["hostelWise"] = hostels
        response_data["studentLeaveFrequency"] = [
            {
                "studentId": student_id,
                "studentName": users[student_id].name,
                "rollNumber": users[student_id].roll_number,
                "leaveCount": count,
            }
            for student_id, count in sorted(
                ((str(student_id), count) for student_id, count in frequencies.items()),
                key=lambda item: (-item[1], users[item[0]].name.lower()),
            )[:10]
        ]
    return Response(response_data)
