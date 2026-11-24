from .models import Hostel


def normalize_hostel_name(value):
    return "".join(
        character
        for character in str(value or "").casefold()
        if character.isalnum()
    )


def find_active_hostel(value):
    normalized_name = normalize_hostel_name(value)
    if not normalized_name:
        return None
    matches = [
        hostel
        for hostel in Hostel.objects.filter(is_active=True).select_related("warden")
        if normalize_hostel_name(hostel.name) == normalized_name
    ]
    return matches[0] if len(matches) == 1 else None
