from django.db import models


class Board(models.Model):
    name = models.CharField(max_length=255)
    image_url = models.URLField(max_length=10000, blank=True)


class List(models.Model):
    name = models.CharField(max_length=255)
    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name="categories"
    )
    position = models.PositiveIntegerField()


class Card(models.Model):
    description = models.TextField(blank=True)
    image_url = models.URLField(max_length=10000, blank=True)
    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name="cards")
    position = models.PositiveIntegerField()
