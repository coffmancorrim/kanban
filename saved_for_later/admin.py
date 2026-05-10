from django.contrib import admin
from .models import APIKey, Category, Media


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('label', 'key', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('label', 'key')
    readonly_fields = ('key', 'created_at')

    def save_model(self, request, obj, form, change):
        if not obj.key:
            obj.key = APIKey.generate_key()
        super().save_model(request, obj, form, change)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('name', 'display', 'counter', 'date_created', 'last_accessed')
    list_filter = ('display', 'category')
    search_fields = ('name', 'summary', 'notes')
    readonly_fields = ('date_created', 'last_accessed')
    filter_horizontal = ('category',)