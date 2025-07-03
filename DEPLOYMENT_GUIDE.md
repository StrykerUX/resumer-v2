# Guía de Despliegue - Staging y Producción

## 🚀 Configuración para Staging y Producción

### 📋 Plan de despliegue

Esta guía te ayudará a configurar el sistema de pagos multi-moneda con Stripe para **staging** y **producción** usando Dokploy en tu VPS.

---

## 1. STAGING (Modo Test de Stripe)

### Variables de entorno en Dokploy

```bash
# Base de datos (PostgreSQL en VPS)
DATABASE_URL="postgresql://usuario:password@localhost:5432/resumer_staging"

# NextAuth
NEXTAUTH_SECRET="staging-secret-key-super-secure"
NEXTAUTH_URL="https://staging.tu-dominio.com"

# Stripe TEST (mismas claves que usas localmente)
STRIPE_SECRET_KEY="sk_test_51RgahlRkB6eo6qCH..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51RgahlRkB6eo6qCH..."
STRIPE_WEBHOOK_SECRET="whsec_NUEVO_PARA_STAGING"

# Precios de prueba (mismos que local)
STRIPE_PRICE_BASIC_MXN="price_1Rgb9pRkB6eo6qCHAorMO2DF"
STRIPE_PRICE_PRO_MXN="price_1Rgb9pRkB6eo6qCHh3TzucyM"
STRIPE_PRICE_PREMIUM_MXN="price_1Rgb9qRkB6eo6qCHmpi903vw"
STRIPE_PRICE_BASIC_USD="price_1Rgb9qRkB6eo6qCHjmmootvM"
STRIPE_PRICE_PRO_USD="price_1Rgb9rRkB6eo6qCHreRFbsgi"
STRIPE_PRICE_PREMIUM_USD="price_1Rgb9rRkB6eo6qCHIYQa4y7j"

# Cloudflare R2 (opcional - mismo que local)
R2_ACCESS_KEY_ID="b9a1f3877421deb041a8b6bed0a3e4a8"
R2_SECRET_ACCESS_KEY="23005a3585ab19012801fc65921f00e2fca3df95baff36aac30558fb303ba520"
R2_BUCKET_NAME="resumer-cvs"
R2_ENDPOINT="https://33da78a61008af7cef00a37eca328081.r2.cloudflarestorage.com"
R2_PUBLIC_URL="https://33da78a61008af7cef00a37eca328081.r2.cloudflarestorage.com"
```

### Configurar webhook en Stripe Dashboard para Staging

1. Ve a: https://dashboard.stripe.com/test/webhooks
2. Clic en "Add endpoint"
3. URL del endpoint: `https://staging.tu-dominio.com/api/stripe/webhook`
4. Eventos a seleccionar:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded` (opcional)
   - ✅ `payment_intent.succeeded` (opcional)
5. Copiar el webhook secret → Usar en `STRIPE_WEBHOOK_SECRET`

---

## 2. PRODUCCIÓN (Modo Live de Stripe)

### ⚠️ IMPORTANTE: Activar cuenta de Stripe para modo Live

Antes de configurar producción, necesitas:
- ✅ Completar verificación de identidad en Stripe
- ✅ Agregar información bancaria
- ✅ Activar modo live en Stripe Dashboard

### Variables de entorno para Producción

```bash
# Base de datos (PostgreSQL en VPS)
DATABASE_URL="postgresql://usuario:password@localhost:5432/resumer_production"

# NextAuth
NEXTAUTH_SECRET="production-secret-key-ultra-secure-random-string"
NEXTAUTH_URL="https://tu-dominio.com"

# Stripe LIVE (nuevas claves de producción)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_NUEVO_PARA_PRODUCCION"

# Precios LIVE (hay que crear nuevos en modo live)
STRIPE_PRICE_BASIC_MXN="price_live_NUEVO_BASICO_MXN"
STRIPE_PRICE_PRO_MXN="price_live_NUEVO_PRO_MXN"
STRIPE_PRICE_PREMIUM_MXN="price_live_NUEVO_PREMIUM_MXN"
STRIPE_PRICE_BASIC_USD="price_live_NUEVO_BASICO_USD"
STRIPE_PRICE_PRO_USD="price_live_NUEVO_PRO_USD"
STRIPE_PRICE_PREMIUM_USD="price_live_NUEVO_PREMIUM_USD"

# Cloudflare R2 (mismo que staging o bucket separado)
R2_ACCESS_KEY_ID="tu_access_key"
R2_SECRET_ACCESS_KEY="tu_secret_key"
R2_BUCKET_NAME="resumer-cvs-prod"
R2_ENDPOINT="https://tu_endpoint.r2.cloudflarestorage.com"
R2_PUBLIC_URL="https://tu_endpoint.r2.cloudflarestorage.com"
```

### Crear productos de Stripe para Producción

1. **Cambiar a modo Live en Stripe Dashboard**
2. **Actualizar temporalmente .env.local con claves live**
3. **Ejecutar script de creación de productos:**
```bash
# Asegúrate de que STRIPE_SECRET_KEY sea la clave live
node scripts/setup-stripe-products.js
```
4. **Copiar los nuevos price IDs generados**
5. **Revertir .env.local a claves de test**

### Configurar webhook en Stripe Dashboard para Producción

1. Ve a: https://dashboard.stripe.com/webhooks (modo LIVE)
2. Clic en "Add endpoint"
3. URL del endpoint: `https://tu-dominio.com/api/stripe/webhook`
4. Eventos: Mismos que staging
5. Copiar webhook secret → Usar en producción

---

## 📝 CHECKLIST PASO A PASO

### STAGING:
- [ ] Deploy aplicación en Dokploy con subdominio staging
- [ ] Configurar PostgreSQL database para staging
- [ ] Configurar todas las variables de entorno (TEST mode)
- [ ] Ejecutar migraciones de Prisma: `npx prisma migrate deploy`
- [ ] Crear webhook en Stripe Dashboard (TEST mode)
- [ ] Probar compras con tarjetas de prueba (4242 4242 4242 4242)
- [ ] Verificar que créditos se agreguen automáticamente
- [ ] Verificar logs del webhook en Stripe Dashboard

### PRODUCCIÓN:
- [ ] **Activar cuenta Stripe para modo live**
- [ ] **Crear productos y precios en modo LIVE** usando el script
- [ ] Deploy aplicación en Dokploy con dominio principal
- [ ] Configurar PostgreSQL database para producción
- [ ] Configurar todas las variables de entorno (LIVE mode)
- [ ] Ejecutar migraciones de Prisma en producción
- [ ] Crear webhook en Stripe Dashboard (LIVE mode)
- [ ] **Probar con tarjeta real (pequeña cantidad primero)**
- [ ] Verificar que pagos reales se procesen correctamente
- [ ] Configurar monitoreo y alertas

---

## 🛠️ Configuración en Dokploy

### Para cada ambiente (staging/producción):

1. **Crear nuevo proyecto en Dokploy**
   - Nombre: `resumer-staging` o `resumer-production`
   - Repositorio: Tu repo de GitHub

2. **Configurar variables de entorno**
   - Copiar todas las variables según el ambiente
   - ⚠️ **NUNCA** mezclar claves de test con live

3. **Setup base de datos PostgreSQL**
   ```bash
   # Crear databases
   createdb resumer_staging
   createdb resumer_production
   ```

4. **Ejecutar migraciones Prisma:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Configurar dominio/subdominio**
   - Staging: `staging.tu-dominio.com`
   - Producción: `tu-dominio.com`

---

## ⚡ Diferencias clave entre ambientes

| Aspecto | Staging | Producción |
|---------|---------|------------|
| **Stripe Mode** | Test mode | Live mode |
| **Tarjetas** | 4242 4242 4242 4242 | Tarjetas reales |
| **Pagos** | Simulados | Reales |
| **Webhook URL** | staging.domain.com | domain.com |
| **Base de datos** | PostgreSQL staging | PostgreSQL prod |
| **Price IDs** | Test price IDs | Live price IDs |
| **Logs** | Más verbosos | Solo errores |

---

## 🔒 Consideraciones de Seguridad

### Variables de entorno:
- ✅ Usar secretos únicos y seguros para cada ambiente
- ✅ Nunca commitear claves de producción al repositorio
- ✅ Rotar secretos periódicamente
- ✅ Usar HTTPS siempre en producción

### Base de datos:
- ✅ Backups automáticos configurados
- ✅ Acceso restringido por IP
- ✅ Credenciales seguras y únicas

### Monitoring:
- ✅ Logs de errores configurados
- ✅ Alertas de Stripe configuradas
- ✅ Monitoreo de uptime

---

## 🧪 Testing

### Staging (Tarjetas de prueba):
```
Éxito: 4242 4242 4242 4242
Falla: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Producción:
- Empezar con transacciones pequeñas
- Verificar que el dinero llegue a tu cuenta bancaria
- Probar diferentes métodos de pago si los soportas

---

## 🆘 Troubleshooting

### Webhook no funciona:
1. Verificar que la URL sea accesible públicamente
2. Revisar logs en Stripe Dashboard
3. Verificar que el webhook secret sea correcto
4. Comprobar que los eventos estén seleccionados

### Pagos no se procesan:
1. Verificar claves de Stripe (test vs live)
2. Revisar logs de la aplicación
3. Verificar que los price IDs existan en el modo correcto
4. Comprobar configuración de webhooks

### Base de datos:
1. Verificar conexión a PostgreSQL
2. Comprobar que las migraciones se ejecutaron
3. Verificar permisos de usuario de BD

---

## 🎯 Próximos pasos recomendados

1. **¿Empezar con staging?** - Configurar ambiente de pruebas
2. **¿VPS configurado?** - Verificar que Dokploy esté funcionando
3. **¿PostgreSQL listo?** - Configurar base de datos
4. **¿Dominio configurado?** - Setup DNS y certificados SSL

---

## 📞 Soporte

Si encuentras problemas:
- Revisar logs de Dokploy
- Verificar logs de Stripe Dashboard
- Comprobar variables de entorno
- Verificar conectividad de red

---

*Guía creada para el proyecto Resumer-v2 - Sistema de mejora de CVs con IA*