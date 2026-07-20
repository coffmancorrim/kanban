from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("board/<int:pk>/", views.board, name="board"),
    path("list/<int:pk>/", views.list_detail, name="list"),
    path("list/", views.list_create, name="list_create"),
    path("card/<int:pk>/", views.card, name="card"),
    path("card/", views.card_create, name="card_create"),
    path("test/", views.test, name="test"),
]
