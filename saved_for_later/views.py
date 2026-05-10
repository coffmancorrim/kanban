from django.db.models import Q
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from saved_for_later.models import Category, Media
from saved_for_later.serializers import CategorySerializer, MediaSerializer


@api_view(["GET"])
def demo_category_list(request):
    categories = Category.objects.filter(is_demo=True)
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def demo_media_list(request):
    queryset = Media.objects.filter(is_demo=True)
    query = request.query_params.get("query")
    if query is not None:
        queryset = queryset.filter(
            Q(name__icontains=query)
            | Q(category__name__icontains=query)
            | Q(summary__icontains=query)
        )
    serializer = MediaSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def category_list(request):
    categories = Category.objects.filter(is_demo=False)
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(["GET", "POST"])
def media_list(request):
    if request.method == "GET":
        queryset = Media.objects.filter(is_demo=False)
        query = request.query_params.get("query")
        if query is not None:
            queryset = queryset.filter(
                Q(name__icontains=query)
                | Q(category__name__icontains=query)
                | Q(summary__icontains=query)
            )
        serializer = MediaSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = MediaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def home(request):
    media_items = Media.objects.all()
    return render(request, "saved_for_later/home.html", {"media_items": media_items})
