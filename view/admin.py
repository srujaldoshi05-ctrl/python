from django.contrib import admin
from .models import QuizUser, QuizScore, QuizProgress

@admin.register(QuizUser)
class QuizUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'created_at')
    search_fields = ('username',)

@admin.register(QuizScore)
class QuizScoreAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'set_number', 'score', 'total_questions', 'time_taken', 'created_at')
    list_filter = ('set_number', 'created_at')
    search_fields = ('user_name',)

@admin.register(QuizProgress)
class QuizProgressAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'set_number', 'current_index', 'updated_at')
    list_filter = ('set_number', 'updated_at')
    search_fields = ('user_name',)
