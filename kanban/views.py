from django.shortcuts import get_object_or_404, render
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Board, Card, List
from .serializers import BoardSerializer, CardSerializer, ListSerializer


@api_view(["GET", "PUT", "PATCH"])
def board(request, pk):
    board = get_object_or_404(Board.objects.prefetch_related("lists__cards"), pk=pk)

    if request.method == "GET":
        serializer = BoardSerializer(board)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        partial = request.method == "PATCH"
        serializer = BoardSerializer(board, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(["GET", "PUT", "PATCH"])
def list_detail(request, pk):
    list = get_object_or_404(List, pk=pk)

    if request.method == "GET":
        serializer = ListSerializer(list)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        partial = request.method == "PATCH"
        serializer = ListSerializer(list, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(["GET", "PUT", "PATCH"])
def card(request, pk):
    card = get_object_or_404(Card, pk=pk)

    if request.method == "GET":
        serializer = CardSerializer(card)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        partial = request.method == "PATCH"
        serializer = CardSerializer(card, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


def test(request):
    board = get_object_or_404(Board, pk=1)
    lists = (
        List.objects.filter(board=board).prefetch_related("cards").order_by("position")
    )

    return render(
        request,
        "kanban/test.html",
        {
            "board": board,
            "lists": lists,
        },
    )


def home(request):
    return render(request, "kanban/home.html")
