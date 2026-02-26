from django.shortcuts import render
from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Max
from .models import QuizUser, QuizScore, QuizProgress
import json


def home(request):
    return render(request, 'index.html')


@csrf_exempt
def auth_user(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'invalid request'}, status=405)

    try:
        data = json.loads(request.body)
        user, created = QuizUser.objects.get_or_create(username=data.get('username'))
        if created:
            user.set_password("default_dummy_pass")
            user.save()
        return JsonResponse({'status': 'success', 'message': 'Account created' if created else 'Welcome back'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@csrf_exempt
def change_password(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'invalid request'}, status=405)

    try:
        data = json.loads(request.body)
        user = QuizUser.objects.get(username=data.get('username'))
        if not user.verify_password(data.get('old_password')):
            return JsonResponse({'status': 'error', 'message': 'Old password incorrect'}, status=401)
        user.set_password(data.get('new_password'))
        user.save()
        return JsonResponse({'status': 'success'})
    except QuizUser.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@csrf_exempt
def save_progress(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'invalid request'}, status=405)

    try:
        data = json.loads(request.body)
        QuizProgress.objects.update_or_create(
            user_name=data.get('user_name'),
            set_number=data.get('set_number'),
            defaults={
                'current_index': data.get('current_index'),
                'user_answers': data.get('user_answers'),
                'time_spent': data.get('time_spent')
            }
        )
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


def get_progress(request):
    try:
        p = QuizProgress.objects.get(
            user_name=request.GET.get('user_name'),
            set_number=request.GET.get('set_number')
        )
        return JsonResponse({'status': 'success', 'progress': {
            'current_index': p.current_index,
            'user_answers': p.user_answers,
            'time_spent': p.time_spent
        }})
    except QuizProgress.DoesNotExist:
        return JsonResponse({'status': 'not_found'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@csrf_exempt
def save_score(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'invalid request'}, status=405)

    try:
        data = json.loads(request.body)
        QuizScore.objects.create(**{
            k: data.get(k) for k in
            ('user_name', 'set_number', 'score', 'total_questions', 'time_taken')
        })
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


def get_scores(request):
    scores = QuizScore.objects.filter(
        user_name=request.GET.get('user_name')
    ).order_by('-created_at')

    return JsonResponse({'scores': [{
        'set_number': s.set_number,
        'score': s.score,
        'total_questions': s.total_questions,
        'time_taken': s.time_taken,
        'date': s.created_at.strftime('%Y-%m-%d %H:%M')
    } for s in scores]})


def get_leaderboard(request):
    data = QuizScore.objects.values('user_name', 'set_number').annotate(
        score=Max('score')
    ).order_by('-score')[:10]

    return JsonResponse({'leaderboard': list(data)})
