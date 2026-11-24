from django.db.models import Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from accounts.models import User
from accounts.permissions import IsAdminRole
from leaves.models import LeaveRequest

from .models import Hostel
from .serializers import HostelSerializer
from .utils import normalize_hostel_name


@api_view(["GET"])
@permission_classes([AllowAny])
def active_hostel_options(_request):
    return Response({
        "items": [
            {"id": str(hostel.id), "name": hostel.name}
            for hostel in Hostel.objects.filter(is_active=True).order_by("name")
        ]
    })


def _hostel_name_exists(name, exclude_id=None):
    candidates = Hostel.objects.all()
    if exclude_id:
        candidates = candidates.exclude(pk=exclude_id)
    normalized_name = normalize_hostel_name(name)
    return any(
        normalize_hostel_name(hostel.name) == normalized_name
        for hostel in candidates.only("name")
    )


def _validated_fields(data, current=None):
    current = current or {}
    name = str(data.get("name", current.get("name", ""))).strip()
    location = str(data.get("location", current.get("location", ""))).strip()
    raw_capacity = data.get("capacity", current.get("capacity"))
    try:
        capacity = int(raw_capacity)
    except (TypeError, ValueError):
        return None, Response({"error": "Capacity must be a positive whole number."}, status=400)
    if not name or len(name) > 100:
        return None, Response({"error": "Hostel name is required and must be 100 characters or fewer."}, status=400)
    if not location or len(location) > 200:
        return None, Response({"error": "Location is required and must be 200 characters or fewer."}, status=400)
    if capacity < 1:
        return None, Response({"error": "Capacity must be a positive whole number."}, status=400)
    warden_id = data.get("wardenId", current.get("warden_id"))
    if warden_id == "":
        warden_id = None
    warden = None
    if warden_id:
        warden = User.objects.filter(pk=warden_id, is_active=True, role=User.Role.WARDEN).first()
        if not warden:
            return None, Response({"error": "Choose an active warden account."}, status=400)
    return {"name": name, "location": location, "capacity": capacity, "warden": warden}, None


@api_view(["GET", "POST"])
@permission_classes([IsAdminRole])
def hostels(request):
    if request.method == "POST":
        fields, error = _validated_fields(request.data)
        if error:
            return error
        if _hostel_name_exists(fields["name"]):
            return Response({"error": "A hostel with this name already exists."}, status=409)
        hostel = Hostel.objects.create(**fields)
        return Response({"hostel": HostelSerializer(hostel).data}, status=201)

    include_inactive = request.query_params.get("includeInactive", "false")
    if include_inactive not in {"true", "false"}:
        return Response({"error": "includeInactive must be true or false."}, status=400)
    queryset = Hostel.objects.select_related("warden")
    if include_inactive == "false":
        queryset = queryset.filter(is_active=True)
    items = []
    for hostel in queryset:
        result = HostelSerializer(hostel).data
        student_count = User.objects.filter(
            role=User.Role.STUDENT,
            is_active=True,
            hostel_block__iexact=hostel.name,
        ).count()
        result["studentCount"] = student_count
        result["occupancyPercent"] = round(student_count * 100 / hostel.capacity)
        items.append(result)
    return Response({"items": items})


@api_view(["POST"])
@permission_classes([IsAdminRole])
def reactivate_hostel(request, hostel_id):
    hostel = Hostel.objects.filter(pk=hostel_id).select_related("warden").first()
    if not hostel:
        return Response({"error": "Hostel not found."}, status=404)
    if hostel.is_active:
        return Response({"error": "Hostel is already active."}, status=409)
    hostel.is_active = True
    hostel.save(update_fields=["is_active", "updated_at"])
    return Response({"hostel": HostelSerializer(hostel).data})


@api_view(["PUT", "DELETE"])
@permission_classes([IsAdminRole])
def hostel_detail(request, hostel_id):
    hostel = Hostel.objects.filter(pk=hostel_id, is_active=True).select_related("warden").first()
    if not hostel:
        return Response({"error": "Hostel not found."}, status=404)
    if request.method == "DELETE":
        hostel.is_active = False
        hostel.save(update_fields=["is_active", "updated_at"])
        return Response(status=204)
    fields, error = _validated_fields(request.data, {
        "name": hostel.name,
        "location": hostel.location,
        "capacity": hostel.capacity,
        "warden_id": str(hostel.warden_id) if hostel.warden_id else None,
    })
    if error:
        return error
    if _hostel_name_exists(fields["name"], exclude_id=hostel.pk):
        return Response({"error": "A hostel with this name already exists."}, status=409)
    old_name = hostel.name
    for key, value in fields.items():
        setattr(hostel, key, value)
    hostel.save()
    if old_name != hostel.name:
        students = User.objects.filter(role=User.Role.STUDENT)
        for student in students.only("id", "hostel_block"):
            if normalize_hostel_name(student.hostel_block) == normalize_hostel_name(old_name):
                User.objects.filter(pk=student.pk).update(
                    hostel_block=hostel.name,
                    updated_at=timezone.now(),
                )
    return Response({"hostel": HostelSerializer(hostel).data})
