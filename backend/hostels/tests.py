from rest_framework.test import APITestCase

from accounts.models import User
from .models import Hostel


class HostelReactivationApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com",
            password="valid-password-123",
            name="Admin",
            role=User.Role.ADMIN,
        )
        self.warden = User.objects.create_user(
            email="warden@example.com",
            password="valid-password-123",
            name="Warden",
            role=User.Role.WARDEN,
        )
        self.student = User.objects.create_user(
            email="student@example.com",
            password="valid-password-123",
            name="Student",
            role=User.Role.STUDENT,
            roll_number="R100",
            hostel_block="Block A",
        )
        self.hostel = Hostel.objects.create(
            name="Block A",
            location="Hyderabad",
            capacity=20,
            warden=self.warden,
            is_active=False,
        )
        self.client.force_authenticate(self.admin)

    def test_inactive_hostel_is_hidden_by_default_and_included_on_request(self):
        active_response = self.client.get("/api/hostels")
        all_response = self.client.get("/api/hostels?includeInactive=true")

        self.assertEqual(active_response.status_code, 200)
        self.assertEqual(active_response.data["items"], [])
        self.assertEqual(all_response.status_code, 200)
        self.assertEqual(len(all_response.data["items"]), 1)
        self.assertFalse(all_response.data["items"][0]["isActive"])

    def test_reactivating_hostel_preserves_existing_student_and_warden(self):
        response = self.client.post(f"/api/hostels/{self.hostel.id}/reactivate")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["hostel"]["id"], str(self.hostel.id))
        self.assertTrue(response.data["hostel"]["isActive"])
        self.hostel.refresh_from_db()
        self.assertTrue(self.hostel.is_active)
        self.assertEqual(self.hostel.warden_id, self.warden.id)
        self.student.refresh_from_db()
        self.assertEqual(self.student.hostel_block, "Block A")

    def test_public_hostel_options_only_return_active_block_names(self):
        self.hostel.is_active = True
        self.hostel.save(update_fields=["is_active"])
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/hostels/options")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["items"], [{
            "id": str(self.hostel.id),
            "name": self.hostel.name,
        }])

    def test_hostel_name_variants_cannot_create_duplicate_blocks(self):
        self.hostel.is_active = True
        self.hostel.save(update_fields=["is_active"])
        response = self.client.post("/api/hostels", {
            "name": "Block-A",
            "location": "Another location",
            "capacity": 30,
        })

        self.assertEqual(response.status_code, 409)
