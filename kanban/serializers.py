from rest_framework import serializers

from .models import Board, Card, List


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ["id", "description", "position", "list"]


class ListSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = List
        fields = ["id", "name", "position", "cards"]


class BoardSerializer(serializers.ModelSerializer):
    lists = ListSerializer(many=True, read_only=True)

    class Meta:
        model = Board
        fields = ["id", "name", "lists"]
