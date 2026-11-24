from datetime import date, timedelta

from rest_framework.test import APITestCase

from accounts.models import User
from hostels.models import Hostel
from leaves.models import LeaveRequest


class DashboardSummaryTests(APITestCase):
    def test_admin_summary_includes_hostel_share_of_leave_requests(self):
        admin = User.objects.create_user(
            email="admin@example.com",
            password="valid-password-123",
            name="Admin",
            role=User.Role.ADMIN,
        )
        student = User.objects.create_user(
            email="student@example.com",
            password="valid-password-123",
            name="Student",
            role=User.Role.STUDENT,
            roll_number="R100",
            hostel_block="A Block",
        )
        Hostel.objects.create(name="A Block", location="Campus", capacity=100)
        LeaveRequest.objects.create(
            student=student,
            reason="Family visit",
            from_date=date.today() + timedelta(days=1),
            to_date=date.today() + timedelta(days=2),
            parent_contact="9876543210",
            emergency_contact="9876543211",
            destination="Home",
        )
        self.client.force_authenticate(admin)

        response = self.client.get("/api/dashboard/summary")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["hostelWise"][0]["leaveRequestPercent"], 100.0)
