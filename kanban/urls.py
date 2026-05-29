from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("boards/<int:pk>/", views.board, name="board"),
    path("test/", views.test, name="test"),
]
