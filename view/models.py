from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class QuizUser(models.Model):
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def verify_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.username


class QuizScore(models.Model):
    user_name = models.CharField(max_length=100)
    set_number = models.PositiveIntegerField()
    score = models.PositiveIntegerField()
    total_questions = models.PositiveIntegerField()
    time_taken = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_name} - Set {self.set_number} - {self.score}/{self.total_questions}"


class QuizProgress(models.Model):
    user_name = models.CharField(max_length=100)
    set_number = models.PositiveIntegerField()
    current_index = models.PositiveIntegerField(default=0)
    user_answers = models.JSONField(default=dict)
    time_spent = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user_name', 'set_number')

    def __str__(self):
        return f"{self.user_name} - Set {self.set_number} progress"
