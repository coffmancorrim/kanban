from django.contrib.auth.decorators import login_required
from django.db.models import F
from django.shortcuts import get_object_or_404, render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Board, Card, List
from .serializers import (
    BoardSerializer,
    BoardsSerializer,
    CardSerializer,
    ListSerializer,
)


@api_view(["GET", "PUT", "PATCH", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def boards(request):
    if request.method == "GET":
        boards = Board.objects.all()
        serializer = BoardsSerializer(boards, many=True)
        return Response(serializer.data)


@api_view(["GET", "PUT", "PATCH", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
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
        lists_to_update = []
        cards_to_update = []

        for listIndex, list in enumerate(board.lists.all()):
            list.position = listIndex + 1
            lists_to_update.append(list)

            for cardIndex, card in enumerate(list.cards.all()):
                card.position = cardIndex + 1
                cards_to_update.append(card)

        List.objects.bulk_update(lists_to_update, ["position"])
        Card.objects.bulk_update(cards_to_update, ["position"])

        board.updated_count = 0
        board.save()

        board = get_object_or_404(Board.objects.prefetch_related("lists__cards"), pk=pk)
        return Response(BoardSerializer(board).data)

    if request.method == "DELETE":
        board.delete()
        return Response(status=200)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
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

            if list.position % 1 != 0:
                Board.objects.filter(pk=list.board_id).update(
                    updated_count=F("updated_count") + 1
                )
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == "DELETE":
        list.delete()
        return Response(status=200)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
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

    if request.method == "DELETE":
        card.delete()
        return Response(status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def board_create(request):
    serializer = BoardSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def list_create(request):
    serializer = ListSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def card_create(request):
    serializer = CardSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@login_required
def home(request):
    return render(request, "kanban/home.html")
