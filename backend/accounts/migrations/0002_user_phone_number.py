from django.db import migrations, models


def normalize_existing_hostel_blocks(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    Hostel = apps.get_model("hostels", "Hostel")
    hostels = list(Hostel.objects.all())

    def normalized(value):
        return "".join(character for character in (value or "").casefold() if character.isalnum())

    by_name = {}
    for hostel in hostels:
        by_name.setdefault(normalized(hostel.name), []).append(hostel.name)

    for user in User.objects.filter(role="student").exclude(hostel_block__isnull=True):
        matches = by_name.get(normalized(user.hostel_block), [])
        if len(matches) == 1 and user.hostel_block != matches[0]:
            User.objects.filter(pk=user.pk).update(hostel_block=matches[0])


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
        ("hostels", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="phone_number",
            field=models.CharField(blank=True, max_length=10),
        ),
        migrations.RunPython(
            normalize_existing_hostel_blocks,
            migrations.RunPython.noop,
        ),
    ]
