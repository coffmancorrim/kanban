from django.db.models import F
from django.shortcuts import get_object_or_404, render
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Board, Card, List
from .serializers import BoardSerializer, CardSerializer, ListSerializer


@api_view(["GET", "PUT", "PATCH", "POST"])
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

    if request.method == "POST":
        for list in board.lists.all():
            for index, card in enumerate(list.cards.all()):
                card.position = index + 1
                card.save()
        board.updated_count = 0
        board.save()

        board = get_object_or_404(Board.objects.prefetch_related("lists__cards"), pk=pk)
        return Response(BoardSerializer(board).data)


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


@api_view(["POST"])
def list_create(request):
    serializer = ListSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
def card_create(request):
    serializer = CardSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
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

            if card.position % 1 != 0:
                Board.objects.filter(pk=card.list.board_id).update(
                    updated_count=F("updated_count") + 1
                )

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
