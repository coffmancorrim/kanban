from django.shortcuts import render


def test(request):
    return render(request, "kanban/test.html")


def home(request):
    return render(request, "saved_for_later/home.html")
