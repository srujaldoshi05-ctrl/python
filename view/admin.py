from django.contrib import admin
from .models import QuizScore

@admin.register(QuizScore)
class QuizScoreAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'set_number', 'score', 'total_questions', 'time_taken', 'created_at')
    list_filter = ('set_number', 'created_at')
    search_fields = ('user_name',)
