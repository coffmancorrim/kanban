from django.shortcuts import get_object_or_404, render
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Board, List
from .serializers import BoardSerializer


@api_view(["GET"])
def board(request, pk):
    board = get_object_or_404(Board.objects.prefetch_related("lists__cards"), pk=pk)
    serializer = BoardSerializer(board)
    return Response(serializer.data)


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
