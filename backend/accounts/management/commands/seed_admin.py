import os

from django.core.management.base import BaseCommand, CommandError

from accounts.models import User


class Command(BaseCommand):
    help = "Create the first administrator from SEED_ADMIN_* environment variables."

    def handle(self, *args, **options):
        name = os.getenv("SEED_ADMIN_NAME", "").strip()
        email = os.getenv("SEED_ADMIN_EMAIL", "").strip().lower()
        password = os.getenv("SEED_ADMIN_PASSWORD", "")
        configured = sum(bool(value) for value in (name, email, password))
        if configured == 0:
            raise CommandError("Set SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD first.")
        if configured != 3:
            raise CommandError("SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD must all be set.")
        if len(password) < 8:
            raise CommandError("SEED_ADMIN_PASSWORD must be at least 8 characters long.")
        user = User.objects.filter(email__iexact=email).first()
        if user:
            if user.role != User.Role.ADMIN:
                raise CommandError("The configured seed email belongs to a non-admin user.")
            self.stdout.write("Administrator already exists; no changes made.")
            return
        User.objects.create_user(
            email=email,
            password=password,
            name=name,
            role=User.Role.ADMIN,
            is_staff=True,
        )
        self.stdout.write(self.style.SUCCESS("Administrator created."))
