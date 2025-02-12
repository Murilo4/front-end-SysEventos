import json
import mercadopago
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import Payment  # Importe o modelo de pagamento, se necessário


@csrf_exempt
def create_preference(request):
    if request.method == 'POST':
        sdk = mercadopago.SDK(settings.MERCADO_PAGO_ACCESS_TOKEN)

        preference_data = {
            "items": [
                {
                    "title": request.POST.get('title'),
                    "quantity": int(request.POST.get('quantity')),
                    "currency_id": "BRL",
                    "unit_price": float(request.POST.get('unit_price'))
                }
            ],
            "back_urls": {
                "success": "http://localhost:3000/success",
                "failure": "http://localhost:3000/failure",
                "pending": "http://localhost:3000/pending"
            },
            "auto_return": "approved",
            "notification_url": "http://localhost:8000/webhook/"
        }

        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]

        return JsonResponse({
            'preference_id': preference['id']
        })

    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def webhook(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        # Process the webhook data here
        if data.get('type') == 'payment':
            payment_id = data['data']['id']
            sdk = mercadopago.SDK(settings.MERCADO_PAGO_ACCESS_TOKEN)
            payment_info = sdk.payment().get(payment_id)
            status = payment_info['response']['status']
            # Atualize o status do pagamento no seu banco de dados
            # Por exemplo:
            # Payment.objects.filter(payment_id=payment_id).update(status=status)
            print(f"Payment {payment_id} status: {status}")
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Invalid request method'}, status=400)
