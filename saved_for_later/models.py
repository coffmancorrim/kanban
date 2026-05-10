import secrets

from django.db import models


class APIKey(models.Model):
    key = models.CharField(max_length=64, unique=True)
    label = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    @staticmethod
    def generate_key():
        return secrets.token_hex(32)

    @property
    def is_authenticated(self):
        return True


class Category(models.Model):
    name = models.CharField(max_length=100, blank=True)
    is_demo = models.BooleanField(default=False)


class Media(models.Model):
    link = models.URLField(blank=True, max_length=10000)
    image = models.ImageField(upload_to="images/", blank=True)
    image_url = models.URLField(max_length=10000, blank=True)
    category = models.ManyToManyField(Category, blank=True)
    name = models.CharField(max_length=999, blank=True)
    summary = models.TextField(blank=True)
    notes = models.TextField(max_length=2000, blank=True)
    date_created = models.DateTimeField(auto_now_add=True, blank=True)
    last_accessed = models.DateField(auto_now=True, blank=True)
    counter = models.IntegerField(default=-1, blank=True)
    display = models.BooleanField(default=True)
    is_demo = models.BooleanField(default=False)
