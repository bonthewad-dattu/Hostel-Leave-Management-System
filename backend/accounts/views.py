import re

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from hostels.utils import find_active_hostel

from .models import User
from .permissions import IsAdminRole
from .serializers import PublicUserSerializer, StudentProfileSerializer


def _token_for(user):
    return str(RefreshToken.for_user(user).access_token)


def _session_user(user):
    serializer = StudentProfileSerializer if user.role == User.Role.STUDENT else PublicUserSerializer
    return serializer(user).data


def _phone_error(phone_number):
    if not isinstance(phone_number, str) or not re.fullmatch(r"[6-9]\d{9}", phone_number):
        return "Enter a valid 10-digit Indian mobile number."
    return None


def _roll_number_error(roll_number):
    match = re.fullmatch(r"(?:\d{2}|\d{4})[A-Z](\d{3,})", roll_number)
    if not match or int(match.group(1)) < 100:
        return "Use two or four year digits, one letter, then a number starting at 100 (for example, 26A100)."
    return None


def _positive_pagination(query_params):
    try:
        page = int(query_params.get("page", "1"))
        limit = int(query_params.get("limit", "20"))
    except (TypeError, ValueError):
        return None, Response({"error": "Page and limit must be integers."}, status=400)
    if page < 1:
        return None, Response({"error": "Page must be a positive integer."}, status=400)
    if limit < 1 or limit > 100:
        return None, Response({"error": "Limit must be an integer between 1 and 100."}, status=400)
    return (page, limit), None


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password")
    role = data.get("role", "student")
    roll_number = str(data.get("rollNumber", "")).strip().upper()
    hostel_block_input = str(data.get("hostelBlock", "")).strip()
    phone_number = str(data.get("phoneNumber", "")).strip()

    if not name or len(name) > 120:
        return Response({"error": "Name is required and must be 120 characters or fewer."}, status=400)
    try:
        validate_email(email)
    except DjangoValidationError:
        return Response({"error": "Enter a valid email address."}, status=400)
    if len(email) > 254:
        return Response({"error": "Email must be 254 characters or fewer."}, status=400)
    if not isinstance(password, str) or len(password) < 8:
        return Response({"error": "Password must be at least 8 characters long."}, status=400)
    if role != "student":
        return Response({"error": "Public registration is limited to student accounts."}, status=403)
    if not roll_number or len(roll_number) > 40:
        return Response({"error": "Roll number is required and must be 40 characters or fewer."}, status=400)
    roll_number_error = _roll_number_error(roll_number)
    if roll_number_error:
        return Response({"error": roll_number_error}, status=400)
    if not hostel_block_input or len(hostel_block_input) > 80:
        return Response({"error": "Hostel block is required and must be 80 characters or fewer."}, status=400)
    phone_error = _phone_error(phone_number)
    if phone_error:
        return Response({"error": phone_error}, status=400)
    hostel = find_active_hostel(hostel_block_input)
    if User.objects.filter(email__iexact=email).exists() or User.objects.filter(roll_number__iexact=roll_number).exists():
        return Response({"error": "An account with this email or roll number already exists."}, status=409)

    user = User.objects.create_user(
        email=email,
        password=password,
        name=name,
        role=User.Role.STUDENT,
        roll_number=roll_number,
        hostel_block=hostel.name if hostel else hostel_block_input,
        phone_number=phone_number,
    )
    return Response(
        {"user": _session_user(user), "token": _token_for(user)},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    data = request.data
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password")
    role = data.get("role")
    user = User.objects.filter(email__iexact=email).first()
    if not user or not user.is_active or not isinstance(password, str) or not user.check_password(password):
        return Response({"error": "Invalid email or password."}, status=401)
    if role and role != user.role:
        return Response({"error": f"This account is registered as {user.role}."}, status=403)
    return Response({"user": _session_user(user), "token": _token_for(user)})


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    if request.method == "PUT":
        if user.role != User.Role.STUDENT:
            return Response({"error": "Only students can update this profile field."}, status=403)
        phone_number = str(request.data.get("phoneNumber", "")).strip()
        phone_error = _phone_error(phone_number)
        if phone_error:
            return Response({"error": phone_error}, status=400)
        user.phone_number = phone_number
        user.save(update_fields=["phone_number", "updated_at"])
    return Response({"user": _session_user(user)})


@api_view(["GET", "POST"])
@permission_classes([IsAdminRole])
def users(request):
    if request.method == "POST":
        data = request.data
        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip().lower()
        password = data.get("password")
        role = data.get("role")
        roll_number = str(data.get("rollNumber", "")).strip().upper()
        hostel_block_input = str(data.get("hostelBlock", "")).strip()
        phone_number = str(data.get("phoneNumber", "")).strip()
        if not name or len(name) > 120:
            return Response({"error": "Name is required and must be 120 characters or fewer."}, status=400)
        try:
            validate_email(email)
        except DjangoValidationError:
            return Response({"error": "Enter a valid email address."}, status=400)
        if role not in User.Role.values:
            return Response({"error": "Role must be student, warden, or admin."}, status=400)
        if not isinstance(password, str) or len(password) < 8:
            return Response({"error": "Password must be at least 8 characters long."}, status=400)
        if role == User.Role.STUDENT and (not roll_number or not hostel_block_input):
            return Response({"error": "Student accounts require a roll number and hostel block."}, status=400)
        if role == User.Role.STUDENT:
            roll_number_error = _roll_number_error(roll_number)
            if roll_number_error:
                return Response({"error": roll_number_error}, status=400)
            phone_error = _phone_error(phone_number)
            if phone_error:
                return Response({"error": phone_error}, status=400)
            hostel = find_active_hostel(hostel_block_input)
            if not hostel:
                return Response({"error": "Choose an active hostel block from the list."}, status=400)
        else:
            hostel = None
        if User.objects.filter(email__iexact=email).exists():
            return Response({"error": "An account with this email already exists."}, status=409)
        if roll_number and User.objects.filter(roll_number__iexact=roll_number).exists():
            return Response({"error": "An account with this roll number already exists."}, status=409)
        user = User.objects.create_user(
            email=email,
            password=password,
            name=name,
            role=role,
            roll_number=roll_number if role == User.Role.STUDENT else None,
            hostel_block=hostel.name if hostel else None,
            phone_number=phone_number if role == User.Role.STUDENT else "",
        )
        return Response({"user": PublicUserSerializer(user).data}, status=201)

    pagination, error = _positive_pagination(request.query_params)
    if error:
        return error
    page, limit = pagination
    queryset = User.objects.all()
    role = request.query_params.get("role")
    if role:
        if role not in User.Role.values:
            return Response({"error": "Role filter is invalid."}, status=400)
        queryset = queryset.filter(role=role)
    search = request.query_params.get("search", "").strip()
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(email__icontains=search)
            | Q(hostel_block__icontains=search)
        )
    active = request.query_params.get("active")
    if active is not None:
        if active not in {"true", "false"}:
            return Response({"error": "Active filter must be true or false."}, status=400)
        queryset = queryset.filter(is_active=(active == "true"))
    total = queryset.count()
    items = queryset[(page - 1) * limit : page * limit]
    return Response({
        "items": PublicUserSerializer(items, many=True).data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    })


@api_view(["PUT", "DELETE"])
@permission_classes([IsAdminRole])
def user_detail(request, user_id):
    user = User.objects.filter(pk=user_id).first()
    if not user:
        return Response({"error": "User not found."}, status=404)
    if request.method == "DELETE":
        if user.id == request.user.id:
            return Response({"error": "You cannot deactivate your own account."}, status=400)
        if not user.is_active:
            return Response({"error": "Active user not found."}, status=404)
        user.is_active = False
        user.save(update_fields=["is_active", "updated_at"])
        return Response(status=204)

    data = request.data
    name = str(data.get("name", user.name)).strip()
    role = data.get("role", user.role)
    roll_number = str(data.get("rollNumber", user.roll_number) or "").strip().upper()
    hostel_block_input = str(data.get("hostelBlock", user.hostel_block or "")).strip()
    phone_provided = "phoneNumber" in data
    phone_number = str(data.get("phoneNumber", user.phone_number) or "").strip()
    active = data.get("active", user.is_active)
    if not name or len(name) > 120:
        return Response({"error": "Name is required and must be 120 characters or fewer."}, status=400)
    if role not in User.Role.values:
        return Response({"error": "Role must be student, warden, or admin."}, status=400)
    if not isinstance(active, bool):
        return Response({"error": "Active must be a boolean."}, status=400)
    if user.id == request.user.id and not active:
        return Response({"error": "You cannot deactivate your own account."}, status=400)
    if role == User.Role.STUDENT and (not roll_number or not hostel_block_input):
        return Response({"error": "Student accounts require a roll number and hostel block."}, status=400)
    if role == User.Role.STUDENT:
        if "rollNumber" in data or user.role != User.Role.STUDENT:
            roll_number_error = _roll_number_error(roll_number)
            if roll_number_error:
                return Response({"error": roll_number_error}, status=400)
        if phone_provided or user.role != User.Role.STUDENT:
            phone_error = _phone_error(phone_number)
            if phone_error:
                return Response({"error": phone_error}, status=400)
        if "hostelBlock" in data or user.role != User.Role.STUDENT:
            hostel = find_active_hostel(hostel_block_input)
            if not hostel:
                return Response({"error": "Choose an active hostel block from the list."}, status=400)
            hostel_block = hostel.name
        else:
            hostel_block = user.hostel_block
    else:
        hostel = None
        hostel_block = None
    if roll_number and User.objects.filter(roll_number__iexact=roll_number).exclude(pk=user.pk).exists():
        return Response({"error": "That roll number is already assigned."}, status=409)
    user.name = name
    user.role = role
    user.roll_number = roll_number if role == User.Role.STUDENT else None
    user.hostel_block = hostel_block
    user.phone_number = phone_number if role == User.Role.STUDENT else ""
    user.is_active = active
    user.save()
    return Response({"user": PublicUserSerializer(user).data})
