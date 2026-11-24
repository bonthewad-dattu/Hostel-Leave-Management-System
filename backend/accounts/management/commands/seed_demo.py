import os
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from hostels.models import Hostel
from leaves.models import LeaveHistory, LeaveRequest


class Command(BaseCommand):
    help = "Create synthetic demo accounts, hostel, and leave requests."

    def handle(self, *args, **options):
        password = os.getenv("DEMO_PASSWORD", "")
        if len(password) < 8:
            raise CommandError("Set DEMO_PASSWORD to at least 8 characters.")

        with transaction.atomic():
            admin = self._get_or_create_user(
                email="admin@demo.example.com",
                password=password,
                name="Demo Admin",
                role=User.Role.ADMIN,
                is_staff=True,
            )
            warden = self._get_or_create_user(
                email="warden@demo.example.com",
                password=password,
                name="Demo Warden",
                role=User.Role.WARDEN,
            )
            students = [
                self._get_or_create_user(
                    email="student1@demo.example.com",
                    password=password,
                    name="Demo Student One",
                    role=User.Role.STUDENT,
                    roll_number="26A100",
                    hostel_block="Maple Hall",
                    phone_number="9876543210",
                ),
                self._get_or_create_user(
                    email="student2@demo.example.com",
                    password=password,
                    name="Demo Student Two",
                    role=User.Role.STUDENT,
                    roll_number="26A101",
                    hostel_block="Maple Hall",
                    phone_number="9876543211",
                ),
            ]
            hostel, _ = Hostel.objects.get_or_create(
                name="Maple Hall",
                defaults={
                    "location": "Demo Campus",
                    "capacity": 100,
                    "warden": warden,
                },
            )

            today = timezone.localdate()
            self._get_or_create_leave(
                student=students[0],
                reason="Demo family visit",
                from_date=today + timedelta(days=7),
                to_date=today + timedelta(days=8),
                status=LeaveRequest.Status.PENDING,
                changed_by=students[0],
            )
            self._get_or_create_leave(
                student=students[1],
                reason="Demo weekend visit",
                from_date=today + timedelta(days=14),
                to_date=today + timedelta(days=15),
                status=LeaveRequest.Status.APPROVED,
                changed_by=warden,
                reviewed_by=warden,
            )

        self.stdout.write(self.style.SUCCESS("Demo data is ready."))
        self.stdout.write("Demo accounts (all use DEMO_PASSWORD):")
        for email in (
            admin.email,
            warden.email,
            *(student.email for student in students),
        ):
            self.stdout.write(f"- {email}")

    @staticmethod
    def _get_or_create_user(email, password, **defaults):
        user = User.objects.filter(email__iexact=email).first()
        if user:
            if user.role != defaults["role"]:
                raise CommandError(f"{email} exists with a different role.")
            return user

        roll_number = defaults.get("roll_number")
        if roll_number and User.objects.filter(roll_number__iexact=roll_number).exists():
            raise CommandError(f"Roll number {roll_number} is already in use.")
        return User.objects.create_user(email=email, password=password, **defaults)

    @staticmethod
    def _get_or_create_leave(
        student,
        reason,
        from_date,
        to_date,
        status,
        changed_by,
        reviewed_by=None,
    ):
        leave, created = LeaveRequest.objects.get_or_create(
            student=student,
            reason=reason,
            defaults={
                "leave_type": "Personal",
                "from_date": from_date,
                "to_date": to_date,
                "parent_contact": "9876543210",
                "emergency_contact": "9876543211",
                "destination": "Demo destination",
                "status": status,
                "reviewed_at": timezone.now() if reviewed_by else None,
                "reviewed_by": reviewed_by,
            },
        )
        if created:
            LeaveHistory.objects.create(
                leave=leave,
                changed_by=changed_by,
                old_status=None,
                new_status=leave.status,
                note="Demo record",
            )
