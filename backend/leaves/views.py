from datetime import date

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from accounts.models import User
from hostels.models import Hostel

from .models import LeaveHistory, LeaveRequest, ReviewComment
from .serializers import LeaveInputSerializer, LeaveRequestSerializer

STATUS_LABELS = {
    "pending": "Pending",
    "in_review": "In Review",
    "approved": "Approved",
    "rejected": "Rejected",
    "cancelled": "Cancelled",
}
FINAL_STATUSES = {"approved", "rejected", "cancelled"}
VALID_STATUSES = set(STATUS_LABELS)


def _error(message, status=400):
    return Response({"error": message}, status=status)


def _normal_status(value):
    return str(value or "").strip().lower().replace(" ", "_")


def _warden_can_access(user, leave):
    if user.role != User.Role.WARDEN:
        return False
    if user.hostel_block and (user.hostel_block.casefold() == (leave.student.hostel_block or "").casefold()):
        return True
    return Hostel.objects.filter(
        is_active=True,
        warden=user,
        name__iexact=leave.student.hostel_block or "",
    ).exists()


def _can_read(user, leave):
    return (
        user.role == User.Role.ADMIN
        or leave.student_id == user.id
        or _warden_can_access(user, leave)
    )


def _get_leave(leave_id):
    return LeaveRequest.objects.select_related("student", "reviewed_by").filter(pk=leave_id).first()


def _comment_data(comment):
    return {
        "id": str(comment.id),
        "authorId": str(comment.author_id) if comment.author_id else None,
        "author": comment.author_name,
        "message": comment.message,
        "createdAt": comment.created_at,
    }


def _history_data(row):
    return {
        "id": str(row.id),
        "changedBy": str(row.changed_by_id) if row.changed_by_id else None,
        "oldStatus": STATUS_LABELS.get(row.old_status) if row.old_status else None,
        "newStatus": STATUS_LABELS[row.new_status],
        "note": row.note,
        "createdAt": row.created_at,
    }


def _add_history(leave, user, old_status, new_status, note=None):
    LeaveHistory.objects.create(
        leave=leave,
        changed_by=user,
        old_status=old_status,
        new_status=new_status,
        note=note or None,
    )


def _pagination(params):
    try:
        page = int(params.get("page", "1"))
        limit = int(params.get("limit", "20"))
    except (TypeError, ValueError):
        return None, _error("Page and limit must be integers.")
    if page < 1:
        return None, _error("Page must be a positive integer.")
    if limit < 1 or limit > 100:
        return None, _error("Limit must be an integer between 1 and 100.")
    return (page, limit), None


@api_view(["GET", "POST"])
def leave_requests(request):
    user = request.user
    if request.method == "POST":
        if user.role != User.Role.STUDENT:
            return _error("You do not have permission to perform this action.", 403)
        serializer = LeaveInputSerializer(data=request.data)
        if not serializer.is_valid():
            return _error(next(iter(serializer.errors.values()))[0])
        values = serializer.validated_data
        overlap = LeaveRequest.objects.filter(
            student=user,
            status__in=[LeaveRequest.Status.PENDING, LeaveRequest.Status.IN_REVIEW, LeaveRequest.Status.APPROVED],
            from_date__lte=values["to_date"],
            to_date__gte=values["from_date"],
        ).exists()
        if overlap:
            return _error("An active leave request already overlaps these dates.", 409)
        with transaction.atomic():
            leave = LeaveRequest.objects.create(student=user, **values)
            _add_history(leave, user, None, leave.status)
        return Response({"request": LeaveRequestSerializer(leave).data}, status=201)

    pagination, error = _pagination(request.query_params)
    if error:
        return error
    page, limit = pagination
    queryset = LeaveRequest.objects.select_related("student", "reviewed_by").all()
    if user.role == User.Role.STUDENT:
        queryset = queryset.filter(student=user)
    elif user.role == User.Role.WARDEN:
        blocks = list(
            Hostel.objects.filter(warden=user, is_active=True).values_list("name", flat=True)
        )
        if user.hostel_block:
            blocks.append(user.hostel_block)
        if not blocks:
            queryset = queryset.none()
        else:
            scope = Q()
            for block in blocks:
                scope |= Q(student__hostel_block__iexact=block)
            queryset = queryset.filter(scope)
    elif user.role != User.Role.ADMIN:
        return _error("You do not have permission to view these requests.", 403)

    status_filter = _normal_status(request.query_params.get("status"))
    if status_filter:
        if status_filter not in VALID_STATUSES:
            return _error("Status filter is invalid.")
        queryset = queryset.filter(status=status_filter)
    hostel_block = request.query_params.get("hostelBlock")
    if hostel_block:
        queryset = queryset.filter(student__hostel_block__iexact=hostel_block.strip())
    student_name = request.query_params.get("studentName")
    if student_name:
        queryset = queryset.filter(student__name__icontains=student_name.strip())
    search = request.query_params.get("search")
    if search:
        queryset = queryset.filter(
            Q(student__name__icontains=search.strip())
            | Q(student__roll_number__icontains=search.strip())
        )
    from_date = request.query_params.get("fromDate")
    to_date = request.query_params.get("toDate")
    if from_date:
        try:
            date.fromisoformat(from_date)
        except ValueError:
            return _error("From date must use YYYY-MM-DD format.")
        queryset = queryset.filter(to_date__gte=from_date)
    if to_date:
        try:
            date.fromisoformat(to_date)
        except ValueError:
            return _error("To date must use YYYY-MM-DD format.")
        queryset = queryset.filter(from_date__lte=to_date)
    warden_id = request.query_params.get("wardenId")
    if warden_id and user.role == User.Role.ADMIN:
        queryset = queryset.filter(student__hostel_block__in=Hostel.objects.filter(
            warden_id=warden_id, is_active=True
        ).values_list("name", flat=True))
    total = queryset.count()
    items = queryset[(page - 1) * limit : page * limit]
    return Response({
        "items": LeaveRequestSerializer(items, many=True).data,
        "pagination": {"page": page, "limit": limit, "total": total, "pages": (total + limit - 1) // limit},
    })


@api_view(["GET", "PUT", "DELETE"])
def leave_detail(request, leave_id):
    leave = _get_leave(leave_id)
    if not leave:
        return _error("Leave request not found.", 404)
    if not _can_read(request.user, leave):
        return _error("You do not have access to this leave request.", 403)
    if request.method == "GET":
        return Response({
            "request": LeaveRequestSerializer(leave).data,
            "comments": [_comment_data(comment) for comment in leave.comments.select_related("author")],
            "history": [_history_data(row) for row in leave.history.select_related("changed_by")],
        })
    if request.method == "DELETE":
        if request.user.role != User.Role.ADMIN and (
            request.user.role != User.Role.STUDENT or leave.student_id != request.user.id
        ):
            return _error("Only the request owner or an administrator can cancel this request.", 403)
        if leave.status != LeaveRequest.Status.PENDING:
            return _error("Only pending requests can be cancelled.", 409)
        old_status = leave.status
        leave.status = LeaveRequest.Status.CANCELLED
        leave.reviewed_at = timezone.now()
        leave.reviewed_by = request.user
        leave.save()
        _add_history(leave, request.user, old_status, leave.status)
        return Response({"request": LeaveRequestSerializer(leave).data})

    comment = str(request.data.get("comment", request.data.get("wardenComment", ""))).strip()
    if len(comment) > 2000:
        return _error("Comment must be 2000 characters or fewer.")
    if request.user.role == User.Role.STUDENT:
        if leave.student_id != request.user.id or leave.status != LeaveRequest.Status.PENDING:
            return _error("Only pending requests can be edited by their student.", 409)
        if "status" in request.data:
            return _error("Students cannot set a leave request status.", 403)
        existing = {
            "leaveType": leave.leave_type,
            "reason": leave.reason,
            "fromDate": leave.from_date,
            "toDate": leave.to_date,
            "parentContact": leave.parent_contact,
            "emergencyContact": leave.emergency_contact,
            "destination": leave.destination,
        }
        existing.update(request.data)
        serializer = LeaveInputSerializer(data=existing)
        if not serializer.is_valid():
            return _error(next(iter(serializer.errors.values()))[0])
        values = serializer.validated_data
        overlap = LeaveRequest.objects.filter(
            student=request.user,
            status__in=[LeaveRequest.Status.PENDING, LeaveRequest.Status.IN_REVIEW, LeaveRequest.Status.APPROVED],
            from_date__lte=values["to_date"],
            to_date__gte=values["from_date"],
        ).exclude(pk=leave.pk).exists()
        if overlap:
            return _error("Another active request overlaps these dates.", 409)
        for field, value in values.items():
            setattr(leave, field, value)
        leave.save()
    elif request.user.role in {User.Role.WARDEN, User.Role.ADMIN}:
        if request.user.role == User.Role.WARDEN and not _warden_can_access(request.user, leave):
            return _error("You do not have access to this leave request.", 403)
        new_status = _normal_status(request.data.get("status"))
        if new_status:
            if new_status not in VALID_STATUSES:
                return _error("Requested status is invalid.")
            if request.user.role == User.Role.WARDEN:
                allowed = {
                    LeaveRequest.Status.PENDING: {"in_review", "approved", "rejected"},
                    LeaveRequest.Status.IN_REVIEW: {"approved", "rejected"},
                }
                if new_status not in allowed.get(leave.status, set()):
                    return _error(
                        f"Cannot change {STATUS_LABELS[leave.status]} to {STATUS_LABELS[new_status]}.",
                        409,
                    )
            previous = leave.status
            if previous != new_status:
                leave.status = new_status
                leave.reviewed_at = timezone.now() if new_status in FINAL_STATUSES else None
                leave.reviewed_by = request.user
                leave.save()
                _add_history(leave, request.user, previous, new_status, comment)
        if comment:
            ReviewComment.objects.create(
                leave=leave, author=request.user, author_name=request.user.name, message=comment
            )
        elif not new_status:
            leave.save()
    else:
        return _error("You do not have permission to review requests.", 403)
    return Response({"request": LeaveRequestSerializer(leave).data})


@api_view(["GET", "POST"])
def leave_comments(request, leave_id):
    leave = _get_leave(leave_id)
    if not leave:
        return _error("Leave request not found.", 404)
    if not _can_read(request.user, leave):
        return _error("You do not have access to this leave request.", 403)
    if request.method == "POST":
        if request.user.role not in {User.Role.WARDEN, User.Role.ADMIN}:
            return _error("You do not have permission to perform this action.", 403)
        message = str(request.data.get("message", "")).strip()
        if not message or len(message) > 2000:
            return _error("Comment is required and must be 2000 characters or fewer.")
        comment = ReviewComment.objects.create(
            leave=leave, author=request.user, author_name=request.user.name, message=message
        )
        return Response({"comment": _comment_data(comment)}, status=201)
    return Response({
        "comments": [
            _comment_data(comment)
            for comment in leave.comments.select_related("author")
        ]
    })


@api_view(["GET"])
def leave_history(request, leave_id):
    leave = _get_leave(leave_id)
    if not leave:
        return _error("Leave request not found.", 404)
    if not _can_read(request.user, leave):
        return _error("You do not have access to this leave request.", 403)
    return Response({
        "history": [
            _history_data(row)
            for row in leave.history.select_related("changed_by")
        ]
    })
