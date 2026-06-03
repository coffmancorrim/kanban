from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("board/<int:pk>/", views.board, name="board"),
    path("list/<int:pk>/", views.list_detail, name="list"),
    path("card/<int:pk>/", views.card, name="card"),
    path("test/", views.test, name="test"),
]
