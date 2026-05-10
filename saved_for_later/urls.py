from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("sfl/media-list/", views.media_list),
    path("sfl/category-list/", views.category_list),
]
