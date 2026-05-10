from django.shortcuts import render

from saved_for_later.models import Media


# Create your views here.
def home(request):
    return render(request, "saved_for_later/home.html")
