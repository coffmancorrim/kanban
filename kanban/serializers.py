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
    position = serializers.DecimalField(
        max_digits=20, decimal_places=10, coerce_to_string=False
    )

    class Meta:
        model = List
        fields = ["id", "name", "position", "board"]


class BoardSerializer(serializers.ModelSerializer):
    backgroundImageUrl = serializers.URLField(
        source="background_image_url", required=False, allow_blank=True
    )
    backgroundColor = serializers.CharField(
        source="background_color", required=False, allow_blank=True
    )
    updatedCount = serializers.IntegerField(source="updated_count", required=False)

    class Meta:
        model = Board
        fields = ["id", "name", "updatedCount", "backgroundImageUrl", "backgroundColor"]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        lists = ListSerializer(instance.lists.all(), many=True).data
        cards = CardSerializer(
            Card.objects.filter(list__board=instance), many=True
        ).data

        return {
            "board": data,
            "lists": {str(lst["id"]): lst for lst in lists},
            "cards": {str(card["id"]): card for card in cards},
        }


class BoardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = [
            "id",
            "name",
        ]
