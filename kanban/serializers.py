from rest_framework import serializers

from .models import Board, Card, List


class CardSerializer(serializers.ModelSerializer):
    imageUrl = serializers.URLField(
        source="image_url", required=False, allow_blank=True
    )

    position = serializers.DecimalField(
        max_digits=20, decimal_places=10, coerce_to_string=False
    )

    class Meta:
        model = Card
        fields = ["id", "description", "position", "list", "imageUrl"]


class ListSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = List
        fields = ["id", "name", "position", "cards", "board"]


class BoardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = [
            "id",
            "name",
        ]


class BoardSerializer(serializers.ModelSerializer):
    lists = ListSerializer(many=True, read_only=True)

    backgroundImageUrl = serializers.URLField(
        source="background_image_url", required=False, allow_blank=True
    )

    backgroundColor = serializers.CharField(
        source="background_color", required=False, allow_blank=True
    )

    updatedCount = serializers.IntegerField(source="updated_count", required=False)

    class Meta:
        model = Board
        fields = [
            "id",
            "name",
            "updatedCount",
            "backgroundImageUrl",
            "backgroundColor",
            "lists",
        ]
