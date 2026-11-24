from django.contrib import admin

from .models import LeaveHistory, LeaveRequest, ReviewComment

admin.site.register(LeaveRequest)
admin.site.register(ReviewComment)
admin.site.register(LeaveHistory)
