from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsWardenOrAdmin(BasePermission):
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in {"warden", "admin"}
        )
