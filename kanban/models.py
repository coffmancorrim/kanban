from django.db import models


class Board(models.Model):
    name = models.CharField(max_length=255)
    image_url = models.URLField(max_length=10000, blank=True)
    background_image_url = models.URLField(max_length=10000, blank=True)
    background_color = models.CharField(blank=True)
    updated_count = models.IntegerField(default=0)


class List(models.Model):
    name = models.CharField(max_length=255)
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="lists")
    position = models.DecimalField(decimal_places=10, max_digits=20)

    class Meta:
        ordering = ["position"]


class Card(models.Model):
    description = models.TextField(blank=True)
    image_url = models.URLField(max_length=10000, blank=True)
    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name="cards")
    position = models.DecimalField(decimal_places=10, max_digits=20)

    class Meta:
        ordering = ["position"]
