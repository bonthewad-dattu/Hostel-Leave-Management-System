from datetime import date, timedelta

from rest_framework.test import APITestCase

from hostels.models import Hostel

from .models import User


class AuthenticationApiTests(APITestCase):
    def setUp(self):
        self.warden = User.objects.create_user(
            email="warden@example.com",
            password="valid-password-123",
            name="Test Warden",
            role=User.Role.WARDEN,
        )
        self.hostel = Hostel.objects.create(
            name="Block A",
            location="Campus",
            capacity=50,
            warden=self.warden,
        )

    def test_student_registration_returns_frontend_session_shape(self):
        response = self.client.post("/api/auth/register", {
            "name": "Test Student",
            "email": "student@example.com",
            "password": "valid-password-123",
            "role": "student",
            "rollNumber": "26A100",
            "phoneNumber": "9876543210",
            "hostelBlock": "Block-A",
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["user"]["role"], "student")
        self.assertEqual(response.data["user"]["hostelBlock"], "Block A")
        self.assertEqual(response.data["user"]["phoneNumber"], "9876543210")
        self.assertEqual(response.data["user"]["assignedWarden"]["name"], "Test Warden")
        self.assertTrue(response.data["token"])

    def test_student_registration_accepts_two_digit_year_roll_number(self):
        response = self.client.post("/api/auth/register", {
            "name": "Test Student",
            "email": "student@example.com",
            "password": "valid-password-123",
            "role": "student",
            "rollNumber": "26A100",
            "phoneNumber": "9876543210",
            "hostelBlock": "Block A",
        })

        self.assertEqual(response.status_code, 201)

    def test_student_can_enter_a_hostel_block_not_yet_configured(self):
        response = self.client.post("/api/auth/register", {
            "name": "Test Student",
            "email": "student@example.com",
            "password": "valid-password-123",
            "role": "student",
            "rollNumber": "26A100",
            "phoneNumber": "9876543210",
            "hostelBlock": "New Block",
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["user"]["hostelBlock"], "New Block")

    def test_roll_numbers_use_canonical_format_and_are_case_insensitive(self):
        first = self.client.post("/api/auth/register", {
            "name": "First Student",
            "email": "first@example.com",
            "password": "valid-password-123",
            "rollNumber": "26A100",
            "phoneNumber": "9876543210",
            "hostelBlock": "Block A",
        })
        duplicate = self.client.post("/api/auth/register", {
            "name": "Second Student",
            "email": "second@example.com",
            "password": "valid-password-123",
            "rollNumber": "26a100",
            "phoneNumber": "9876543211",
            "hostelBlock": "Block A",
        })
        another_roll_number = self.client.post("/api/auth/register", {
            "name": "Third Student",
            "email": "third@example.com",
            "password": "valid-password-123",
            "rollNumber": "26B100",
            "phoneNumber": "9876543212",
            "hostelBlock": "Block A",
        })

        self.assertEqual(first.status_code, 201)
        self.assertEqual(duplicate.status_code, 409)
        self.assertEqual(another_roll_number.status_code, 201)

    def test_roll_number_rejects_legacy_four_digit_year_format(self):
        response = self.client.post("/api/auth/register", {
            "name": "Test Student",
            "email": "student@example.com",
            "password": "valid-password-123",
            "rollNumber": "2026A100",
            "phoneNumber": "9876543210",
            "hostelBlock": "Block A",
        })

        self.assertEqual(response.status_code, 400)

    def test_roll_number_conflicts_with_equivalent_legacy_value(self):
        User.objects.create_user(
            email="legacy@example.com",
            password="valid-password-123",
            name="Legacy Student",
            role=User.Role.STUDENT,
            roll_number="2026A100",
            hostel_block="Block A",
        )
        response = self.client.post("/api/auth/register", {
            "name": "Test Student",
            "email": "student@example.com",
            "password": "valid-password-123",
            "rollNumber": "26A100",
            "phoneNumber": "9876543210",
            "hostelBlock": "Block A",
        })

        self.assertEqual(response.status_code, 409)

    def test_student_can_update_phone_and_view_assigned_warden(self):
        student = User.objects.create_user(
            email="profile@example.com",
            password="valid-password-123",
            name="Profile Student",
            role=User.Role.STUDENT,
            roll_number="2026A100",
            hostel_block="Block-A",
        )
        self.client.force_authenticate(student)

        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["hostelBlock"], "Block-A")
        self.assertEqual(response.data["user"]["assignedWarden"]["name"], "Test Warden")

        updated = self.client.put(
            "/api/auth/me",
            {"phoneNumber": "9876543210"},
            format="json",
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data["user"]["phoneNumber"], "9876543210")

    def test_registration_rejects_hostel_not_in_active_list(self):
        response = self.client.post("/api/auth/register", {
            "name": "Test Student",
            "email": "student@example.com",
            "password": "valid-password-123",
            "rollNumber": "R100",
            "phoneNumber": "9876543210",
            "hostelBlock": "Unknown Block",
        })
        self.assertEqual(response.status_code, 400)

    def test_registration_rejects_roll_number_outside_college_format(self):
        response = self.client.post("/api/auth/register", {
            "name": "Test Student",
            "email": "student@example.com",
            "password": "valid-password-123",
            "rollNumber": "26A99",
            "phoneNumber": "9876543210",
            "hostelBlock": "Block A",
        })

        self.assertEqual(response.status_code, 400)

    def test_public_registration_rejects_non_student_role(self):
        response = self.client.post("/api/auth/register", {
            "name": "Admin",
            "email": "admin@example.com",
            "password": "valid-password-123",
            "role": "admin",
            "rollNumber": "R101",
            "phoneNumber": "9876543210",
            "hostelBlock": "Block A",
        })
        self.assertEqual(response.status_code, 403)


class AdminUserUpdateApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com",
            password="valid-password-123",
            name="Test Admin",
            role=User.Role.ADMIN,
        )
        self.student = User.objects.create_user(
            email="student@example.com",
            password="valid-password-123",
            name="Test Student",
            role=User.Role.STUDENT,
            roll_number="2026A100",
            hostel_block="Block A",
            phone_number="9876543210",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            password="valid-password-123",
            name="Other User",
            role=User.Role.WARDEN,
        )
        self.client.force_authenticate(self.admin)
        self.url = f"/api/users/{self.student.id}"

    def test_admin_can_update_user_email_and_other_details(self):
        response = self.client.put(
            self.url,
            {"email": "Student.New@Example.com", "name": "Updated Student"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["email"], "student.new@example.com")
        self.assertEqual(response.data["user"]["name"], "Updated Student")
        self.student.refresh_from_db()
        self.assertEqual(self.student.email, "student.new@example.com")

    def test_admin_cannot_set_an_invalid_or_duplicate_email(self):
        invalid = self.client.put(
            self.url,
            {"email": "not-an-email"},
            format="json",
        )
        duplicate = self.client.put(
            self.url,
            {"email": "OTHER@example.com"},
            format="json",
        )

        self.assertEqual(invalid.status_code, 400)
        self.assertEqual(duplicate.status_code, 409)
        self.student.refresh_from_db()
        self.assertEqual(self.student.email, "student@example.com")


class LeaveApiTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email="student@example.com",
            password="valid-password-123",
            name="Test Student",
            role=User.Role.STUDENT,
            roll_number="R100",
            hostel_block="A Block",
        )
        self.client.force_authenticate(self.student)

    def _leave_data(self, start=date.today() + timedelta(days=1)):
        return {
            "leaveType": "Personal",
            "reason": "Family visit",
            "fromDate": start.isoformat(),
            "toDate": (start + timedelta(days=1)).isoformat(),
            "parentContact": "9876543210",
            "emergencyContact": "9876543211",
            "destination": "Home",
        }

    def test_student_can_create_leave_and_read_its_history(self):
        created = self.client.post("/api/leaves", self._leave_data(), format="json")
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["request"]["status"], "Pending")
        detail = self.client.get(f"/api/leaves/{created.data['request']['id']}")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data["history"][0]["newStatus"], "Pending")

    def test_student_cannot_create_overlapping_active_leave(self):
        data = self._leave_data()
        self.client.post("/api/leaves", data, format="json")
        duplicate = self.client.post("/api/leaves", data, format="json")
        self.assertEqual(duplicate.status_code, 409)
