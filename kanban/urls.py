from django.urls import path, re_path

from . import views

urlpatterns = [
    path("boards/", views.boards, name="boards"),
    path("board/<int:pk>/", views.board, name="board"),
    path("board/", views.board_create, name="board_create"),
    path("list/<int:pk>/", views.list_detail, name="list"),
    path("list/", views.list_create, name="list_create"),
    path("card/<int:pk>/", views.card, name="card"),
    path("card/", views.card_create, name="card_create"),
    re_path(r"^.*$", views.home, name="home"),
]
