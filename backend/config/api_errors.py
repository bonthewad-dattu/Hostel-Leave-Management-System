from rest_framework.exceptions import ValidationError
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    detail = response.data
    if isinstance(exc, ValidationError) and isinstance(detail, dict):
        messages = []
        for field_messages in detail.values():
            if isinstance(field_messages, (list, tuple)):
                messages.extend(str(message) for message in field_messages)
            else:
                messages.append(str(field_messages))
        detail = messages[0] if messages else "The submitted data is invalid."
    elif isinstance(detail, dict) and "detail" in detail:
        detail = str(detail["detail"])
    else:
        detail = str(detail)

    response.data = {"error": detail}
    return response
