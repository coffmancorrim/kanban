from rest_framework import serializers

from saved_for_later.models import Category, Media


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class MediaSerializer(serializers.ModelSerializer):
    category = CategorySerializer(many=True, required=False)

    class Meta:
        model = Media
        fields = "__all__"

    def create(self, validated_data):
        categories_data = validated_data.pop("category", [])
        media = Media.objects.create(**validated_data)

        for category_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=category_data["name"]
            )
            media.category.add(category)

        return media
