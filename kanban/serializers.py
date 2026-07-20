from rest_framework import serializers

from .models import Board, Card, List


class CardSerializer(serializers.ModelSerializer):
    imageUrl = serializers.URLField(
        source="image_url", required=False, allow_blank=True
    )

    class Meta:
        model = Card
        fields = ["id", "description", "position", "list", "imageUrl"]


class ListSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = List
        fields = ["id", "name", "position", "cards", "board"]


class BoardSerializer(serializers.ModelSerializer):
    lists = ListSerializer(many=True, read_only=True)

    class Meta:
        model = Board
        fields = ["id", "name", "lists"]
