# Configuración del Webhook de Stripe

## ¿Qué es y por qué es necesario?

El webhook de Stripe es una URL que Stripe llama automáticamente cuando ocurre un evento importante, como un pago exitoso. Sin el webhook, los créditos NO se agregarán automáticamente después del pago.

## Configuración en Stripe Dashboard

### 1. Ir a Webhooks en Stripe
1. Ve a https://dashboard.stripe.com/test/webhooks
2. Haz clic en "Add endpoint"

### 2. Configurar el endpoint
**URL del endpoint:** `https://tu-dominio.com/api/stripe/webhook`

Para desarrollo local:
- Si usas ngrok: `https://abc123.ngrok.io/api/stripe/webhook`
- Si usas localhost: `http://localhost:3000/api/stripe/webhook` (solo para testing)

### 3. Seleccionar eventos
Marca estos eventos:
- ✅ `checkout.session.completed`
- ✅ `invoice.payment_succeeded` (opcional)
- ✅ `payment_intent.succeeded` (opcional)

### 4. Obtener el webhook secret
1. Después de crear el webhook, haz clic en él
2. Ve a la sección "Signing secret"
3. Copia el valor que empieza con `whsec_...`

### 5. Agregar a .env.local
```bash
STRIPE_WEBHOOK_SECRET="whsec_1234567890abcdef..."
```

## Testing del Webhook

### Opción 1: Stripe CLI (Recomendado)
```bash
# Instalar Stripe CLI
# Seguir: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forwarding de eventos a localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# El CLI te dará un webhook secret que empieza con whsec_
# Úsalo en tu .env.local
```

### Opción 2: ngrok (Para exponer localhost)
```bash
# Instalar ngrok: https://ngrok.com/

# Exponer puerto 3000
ngrok http 3000

# Usar la URL https que te da ngrok
# Ejemplo: https://abc123.ngrok.io/api/stripe/webhook
```

## Verificar que funciona

### 1. Logs del webhook
Cuando se ejecute un webhook, verás logs en la consola:
```
🎣 Stripe webhook received
✅ Webhook verified, type: checkout.session.completed
💰 Checkout session completed: { sessionId: '...', metadata: {...} }
✅ Payment processed successfully: { userId: '...', addedCredits: 50 }
```

### 2. En Stripe Dashboard
1. Ve a tu webhook en https://dashboard.stripe.com/test/webhooks
2. Haz clic en tu webhook
3. Ve la pestaña "Recent deliveries"
4. Deberías ver respuestas `200 OK`

### 3. Testear una compra completa
1. Ve a http://localhost:3000/dashboard/credits
2. Haz clic en "Comprar Ahora"
3. Completa el pago en Stripe (usa tarjeta de prueba: `4242 4242 4242 4242`)
4. Verifica que los créditos se agreguen automáticamente

## Tarjetas de Prueba de Stripe

```
Éxito: 4242 4242 4242 4242
Falla: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

Cualquier CVC y fecha futura funcionan.

## Troubleshooting

### Error: "No signature found"
- Verifica que `STRIPE_WEBHOOK_SECRET` esté configurado
- Asegúrate de que la URL del webhook sea correcta

### Error: "Invalid signature"
- El webhook secret está mal
- Copia el secret correcto desde Stripe Dashboard

### Los créditos no se agregan
- Revisa los logs del webhook en la consola
- Verifica que el evento `checkout.session.completed` se esté enviando
- Revisa la metadata en la sesión de checkout

### Webhook no recibe eventos
- Verifica que la URL sea accesible públicamente
- Si usas localhost, usa ngrok o Stripe CLI
- Revisa que los eventos estén seleccionados correctamente