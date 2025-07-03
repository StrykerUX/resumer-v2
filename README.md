# Resumer-v2 🚀

Un Resume Enhancer inteligente que utiliza IA para mejorar CVs y optimizarlos para sistemas ATS.

## 📋 Descripción del Proyecto

Resumer-v2 es una webapp que ayuda a los usuarios a mejorar sus CVs utilizando inteligencia artificial. Los usuarios pueden subir sus documentos, recibir análisis y recomendaciones, y descargar versiones mejoradas optimizadas para sistemas ATS.

## ✨ Características Principales

### 🔐 Sistema de Usuarios
- Registro gratuito
- Autenticación segura con NextAuth.js
- Onboarding guiado

### 💳 Sistema de Créditos
- Integración con Stripe para pagos
- Moneda virtual (créditos)
- Gestión de saldo de usuario

### 📁 Gestión de Archivos
- Subida de archivos: PDF, JPG, Word
- Upload directo a Cloudflare R2
- Procesamiento seguro de documentos
- Vista previa de archivos subidos
- Análisis automático con IA

### 🤖 Integración con IA
- Análisis de CV con OpenAI
- Cuestionario de 3-5 preguntas
- Recomendaciones personalizadas
- Optimización para sistemas ATS

### 🔄 Flujos de Mejora

#### 1. Mejora General (10 créditos)
- Análisis completo del CV actual
- Mejoras generales sin mentir
- Optimización para ATS
- Vista previa antes de descarga

#### 2. Mejora para Propuesta Específica (15 créditos)
- Análisis del CV + descripción del trabajo
- Alineación con requisitos específicos
- Personalización sin exageración
- Optimización targeted

### 📄 Generación de PDFs
- Descarga en formato PDF
- Links funcionales
- Formato profesional
- Compatible con ATS

## 🌍 Internacionalización (i18n)

### Idiomas Soportados
- 🇪🇸 **Español** (idioma principal)
- 🇺🇸 **Inglés** 
- 🇧🇷 **Portugués**

### Funcionalidades i18n
- **Selector de idiomas** visual en la navegación con banderas
- **Detección automática** del idioma del navegador
- **Persistencia** de preferencia en localStorage
- **Traducciones completas** de toda la interfaz de usuario
- **Carga dinámica** de archivos de traducción
- **Loading states** durante cambio de idioma

### Estructura de Traducciones
```
messages/
├── es.json    # Español (idioma base)
├── en.json    # Inglés
└── pt.json    # Portugués
```

### Uso del Sistema de Traducciones
```typescript
import { useTranslations } from '@/hooks/use-translations'

const MyComponent = () => {
  const { t, locale, isLoading } = useTranslations()
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
    </div>
  )
}
```

### Agregar Nuevo Idioma
1. Crear archivo `messages/fr.json` (ejemplo francés)
2. Traducir todas las claves del archivo `es.json`
3. Agregar el idioma al array en `LanguageSelector`
4. Testear la funcionalidad

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React con TypeScript
- **Tailwind CSS** - Styling utilitario
- **Shadcn/ui** - Componentes UI modernos
- **React Hook Form** - Gestión de formularios
- **Framer Motion** - Animaciones fluidas
- **next-intl** - Sistema de internacionalización
- **Lucide React** - Iconos modernos

### Backend
- **Next.js API Routes** - API integrada
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **NextAuth.js** - Autenticación

### Servicios Externos
- **OpenAI API** - Procesamiento de texto con IA
- **Stripe** - Procesamiento de pagos
- **Cloudflare R2** - Almacenamiento de archivos con CDN global
- **Puppeteer** - Generación de PDFs

### DevOps & Deployment
- **Docker** - Containerización
- **Dokploy** - Deployment en VPS
- **GitHub Actions** - CI/CD

## 🏗️ Arquitectura del Proyecto

```
resumer-v2/
├── src/
│   ├── app/                 # App Router (Next.js 14)
│   │   ├── api/            # API Routes
│   │   │   ├── auth/       # Endpoints de autenticación
│   │   │   ├── upload/     # Upload con Cloudflare R2
│   │   │   └── resumes/    # Gestión de currículums
│   │   ├── auth/           # Páginas de autenticación
│   │   ├── dashboard/      # Dashboard del usuario
│   │   │   ├── upload/     # Página de upload
│   │   │   └── resumes/    # Vista previa de CVs
│   │   └── page.tsx        # Landing page
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/            # Componentes base (Shadcn/ui)
│   │   ├── upload/        # Componentes de upload R2
│   │   ├── language-selector.tsx  # Selector de idiomas
│   │   ├── navigation.tsx # Navegación con i18n
│   │   └── providers/     # Context providers
│   ├── hooks/             # Custom React hooks
│   │   └── use-translations.ts    # Hook de traducciones
│   ├── lib/               # Utilidades y configuración
│   │   ├── auth.ts        # Configuración NextAuth
│   │   ├── prisma.ts      # Cliente Prisma
│   │   ├── r2-client.ts   # Cliente Cloudflare R2
│   │   ├── openai.ts      # Cliente OpenAI
│   │   └── stripe.ts      # Configuración Stripe
│   └── types/             # Definiciones TypeScript
├── messages/              # Archivos de traducción
│   ├── es.json           # Traducciones español
│   ├── en.json           # Traducciones inglés
│   └── pt.json           # Traducciones portugués
├── prisma/                # Schema y migraciones
├── public/                # Archivos estáticos
├── docker/                # Configuración Docker
├── scripts/               # Scripts de utilidades
│   └── setup-r2-cors.js  # Configuración CORS para R2
└── docs/                  # Documentación
```

## 🚀 Roadmap de Desarrollo (4 Semanas)

### **Semana 1: Base Funcional Visible** 
**Días 1-3: Setup + Landing Funcional**
- [x] Setup inicial del proyecto
- [x] Next.js 14 + TypeScript + Tailwind
- [x] Landing page completa + navegación
- [x] Formulario de registro funcional
- [x] Diseño responsive mobile/desktop
- [x] **Sistema de idiomas ES/EN/PT implementado**
- **🎯 PREVIEW 1**: Landing navegable + registro visual + selector de idiomas

**Días 4-7: Autenticación Completa**
- [x] Configuración NextAuth.js
- [x] Sistema login/registro funcionando  
- [x] Dashboard básico del usuario
- [x] Setup Prisma + SQLite (desarrollo)
- **🎯 PREVIEW 2**: Flujo completo landing → registro → dashboard ✅

---

### **Semana 2: Funcionalidades Core Visibles**
**Días 8-10: Upload + Vista Previa**
- [x] Integración Cloudflare R2 (migrado desde UploadThing)
- [x] Drag & drop de archivos funcionando
- [x] Procesamiento PDF/Word/JPG con upload directo
- [x] Validaciones visuales de archivos
- [x] Vista previa de archivos subidos
- [x] Barra de progreso en tiempo real
- **🎯 PREVIEW 3**: Subir archivos reales + confirmaciones ✅

**Días 11-14: Créditos + Pagos Multi-Moneda**
- [x] Sistema de créditos en UI con balance real
- [x] Detección automática de país/moneda (timezone + locale)
- [x] Integración Stripe con 6 productos (MXN + USD)
- [x] UI de pricing con ambas monedas dinámicas
- [x] Comprar créditos en moneda detectada (modo test)
- [x] Webhooks Stripe unificados para ambas monedas
- [x] Balance actualizado en tiempo real automáticamente
- [x] Configuración completa Stripe CLI para desarrollo
- **🎯 PREVIEW 4**: Comprar créditos en MXN/USD + ver balance ✅

---

### **Semana 3: IA Funcionando + Flujos Completos**
**Días 15-17: Análisis IA Visible**
- [ ] Cliente OpenAI configurado
- [ ] Subir CV → análisis con IA → resultados
- [ ] Cuestionario funcional (3-5 preguntas)
- [ ] Recomendaciones personalizadas
- **🎯 PREVIEW 5**: CV real analizado por IA + feedback

**Días 18-21: Flujos de Mejora Completos**
- [ ] Mejora General (10 créditos) funcional
- [ ] Mejora Específica (15 créditos) funcional
- [ ] Preview del CV mejorado
- [ ] Validación antes de procesamiento
- **🎯 PREVIEW 6**: Flujo end-to-end completo funcionando

---

### **Semana 4: Producto Final**
**Días 22-24: PDFs + Onboarding**
- [ ] Generación de PDFs con Puppeteer
- [ ] Templates profesionales de CV
- [ ] Descarga de PDF mejorado
- [ ] Onboarding guiado completo
- **🎯 PREVIEW 7**: Descargar PDF real + onboarding

**Días 25-28: Deploy + Optimización**
- [ ] Containerización Docker
- [ ] Deploy en Dokploy
- [ ] Performance optimizada
- [ ] Testing y QA final
- **🎯 PREVIEW 8**: Producto final en producción

---

## 🎯 Demos Funcionales por Etapa

### ✅ Después del Día 7 (COMPLETADO):
**Podrás probar:**
- Navegar la landing page completa en 3 idiomas
- Cambiar idioma dinámicamente con el selector
- Registrarte como usuario nuevo y hacer login
- Ver el dashboard básico funcionando
- Formularios de auth traducidos
- Flujo completo de registro/login
- Dashboard con navegación funcional
- Sistema de sesiones con NextAuth.js

### ✅ Después del Día 10 (COMPLETADO):
**Podrás probar:**
- Subir archivos PDF/Word/JPG reales a Cloudflare R2
- Ver confirmaciones visuales del upload
- Probar validaciones de formato/tamaño
- Upload directo con barra de progreso
- Vista previa detallada de archivos subidos
- Navegación entre dashboard y upload
- Drag & drop completamente funcional

### Después del Día 14:
**Podrás probar:**
- Comprar créditos con tarjeta de prueba Stripe
- Ver balance de créditos actualizado
- Probar restricciones por falta de créditos

### Después del Día 17:
**Podrás probar:**
- Subir CV real → recibir análisis completo de IA
- Completar cuestionario interactivo
- Ver recomendaciones personalizadas detalladas

### Después del Día 21:
**Podrás probar:**
- Proceso completo: Mejora General (gastar 10 créditos)
- Proceso completo: Mejora Específica con job posting
- Ver preview detallado antes de confirmar descarga

### Después del Día 24:
**Podrás probar:**
- Descargar PDF real mejorado y funcional
- Completar onboarding desde cero como nuevo usuario
- Experiencia completa optimizada para mobile

### Después del Día 28:
**Podrás probar:**
- Acceder desde cualquier dispositivo
- Probar con usuarios reales (beta testing)
- Producto completamente funcional y escalable

## 💰 Modelo de Negocio

### Sistema de Créditos
- **Registro gratuito**: 5 créditos de bienvenida
- **Mejora general**: 10 créditos
- **Mejora específica**: 15 créditos

### Planes de Créditos Multi-Moneda
> **Moneda Principal**: MXN (México) | **Moneda Secundaria**: USD (Internacional)
> **Detección Automática**: Por geolocalización IP + headers del navegador

#### **🚀 Plan Básico**
- **50 créditos**
- **MXN**: $69 pesos mexicanos
- **USD**: $3.70 dólares estadounidenses
- **Costo por crédito**: $1.38 MXN / $0.074 USD
- **Ideal para**: Usuarios que prueban el servicio

#### **⭐ Plan Pro (Más Popular)**
- **120 créditos** 
- **MXN**: $129 pesos mexicanos
- **USD**: $6.90 dólares estadounidenses
- **Costo por crédito**: $1.07 MXN / $0.058 USD
- **Descuento**: 22% vs Plan Básico
- **Ideal para**: Job seekers activos

#### **💎 Plan Premium**
- **200 créditos**
- **MXN**: $199 pesos mexicanos  
- **USD**: $10.70 dólares estadounidenses
- **Costo por crédito**: $0.99 MXN / $0.054 USD
- **Descuento**: 28% vs Plan Básico
- **Ideal para**: Profesionales que optimizan múltiples CVs

### Análisis de Costos y Rentabilidad

#### **Costos por Operación de IA (OpenAI GPT-4o)**
- **Análisis inicial**: ~$0.50 MXN por CV
- **Mejora general**: ~$0.72 MXN por CV  
- **Mejora específica**: ~$0.87 MXN por CV

#### **Ejemplo Plan Pro ($129 MXN / 120 créditos)**
```
Uso típico:
• 1 Análisis inicial: $0.50 MXN
• 8 Mejoras generales (80 créditos): $5.76 MXN
• 2-3 Mejoras específicas (40 créditos): $2.08 MXN
• Stripe fees (3.6%): $4.64 MXN

Total costos: ~$13 MXN
Margen bruto: ~90%
```

### Estrategia de Monedas

#### **Detección Automática**
1. **Geolocalización por IP**: Detecta país del usuario
2. **Headers del navegador**: Fallback con Accept-Language
3. **Selector manual**: Usuario puede cambiar moneda
4. **Persistencia**: Preferencia guardada en localStorage

#### **Configuración Stripe**
- **6 productos**: 3 planes × 2 monedas
- **Webhooks unificados**: Maneja ambas monedas
- **Conversión automática**: Tipos de cambio actualizados

#### **UX Multi-Moneda**
- **Precio principal**: Moneda detectada (grande)
- **Precio secundario**: Otra moneda (pequeño)
- **Ejemplo**: "$129 MXN ($6.90 USD)" para usuarios mexicanos

## 🎯 Flujo de Usuario

1. **Landing** → Registro incentivado (multiidioma)
2. **Registro** → Onboarding (traducido)
3. **Upload** → Análisis inicial
4. **Cuestionario** → Recomendaciones
5. **Selección** → Mejora general o específica
6. **Procesamiento** → Preview
7. **Descarga** → PDF optimizado

## 🔧 Configuración de Desarrollo

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- Docker (para deploy)

### Variables de Entorno
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Cloudflare R2
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="resumer-cvs"
R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
R2_PUBLIC_URL="https://your-custom-domain.com"

# OpenAI
OPENAI_API_KEY="sk-..."

# Stripe Multi-Moneda
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Precios Stripe (MXN)
STRIPE_PRICE_BASIC_MXN="price_basic_69mxn"
STRIPE_PRICE_PRO_MXN="price_pro_129mxn"
STRIPE_PRICE_PREMIUM_MXN="price_premium_199mxn"

# Precios Stripe (USD)
STRIPE_PRICE_BASIC_USD="price_basic_370usd"
STRIPE_PRICE_PRO_USD="price_pro_690usd"
STRIPE_PRICE_PREMIUM_USD="price_premium_1070usd"

# Geolocalización (opcional)
IPAPI_KEY="your_ipapi_key" # Para detección de país
```

### Comandos de Desarrollo
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Configurar CORS en Cloudflare R2
node scripts/setup-r2-cors.js
```

### Desarrollo con Múltiples Idiomas

```bash
# Cambiar idioma de prueba en localStorage
localStorage.setItem('language', 'en') // or 'pt', 'es'

# Recargar para ver cambios
window.location.reload()

# Testear todas las traducciones
npm run test:i18n
```

## ☁️ Cloudflare R2 Setup

### ¿Por qué Cloudflare R2?
- **Costos más bajos**: Sin costos de egress, solo almacenamiento
- **CDN global**: Entrega rápida desde edge locations mundiales
- **Control total**: Configuración de CORS, headers, políticas de acceso
- **Escalabilidad**: Compatible con S3 API, fácil migración
- **Rendimiento**: Upload directo desde browser, sin pasar por servidor

### Configuración del Bucket R2

1. **Crear bucket en Cloudflare Dashboard**
   ```bash
   # Ve a: https://dash.cloudflare.com/
   # → R2 Object Storage → Create bucket
   # Nombre: resumer-cvs
   # Región: Automatic
   ```

2. **Obtener credenciales API**
   ```bash
   # Ve a: https://dash.cloudflare.com/profile/api-tokens
   # → Create Token → Custom token
   # Permisos: Account:Cloudflare R2:Edit
   # Account Resources: Include - All accounts
   ```

3. **Configurar variables de entorno**
   ```env
   R2_ACCESS_KEY_ID="tu_access_key_id"
   R2_SECRET_ACCESS_KEY="tu_secret_access_key" 
   R2_BUCKET_NAME="resumer-cvs"
   R2_ENDPOINT="https://tu-account-id.r2.cloudflarestorage.com"
   R2_PUBLIC_URL="https://tu-dominio-personalizado.com"
   ```

4. **Configurar CORS automáticamente**
   ```bash
   node scripts/setup-r2-cors.js
   ```

### Flujo de Upload R2
1. **Frontend**: Solicita pre-signed URL al backend
2. **Backend**: Genera URL firmada con AWS SDK
3. **Upload directo**: Browser → R2 (sin pasar por servidor)
4. **Confirmación**: Backend actualiza estado en base de datos

### Ventajas vs UploadThing
- **Costo**: ~90% más económico para almacenamiento
- **Velocidad**: Upload directo, sin proxy
- **Control**: Configuración completa de bucket
- **Escalabilidad**: Sin límites artificiales
- **CDN**: Cloudflare CDN incluido sin costo extra

## 💳 Sistema de Pagos Multi-Moneda (Stripe)

### ¿Por qué Multi-Moneda?
- **Mercado principal**: México (MXN)
- **Expansión internacional**: USD para resto del mundo
- **UX optimizada**: Precios en moneda local del usuario
- **Conversiones mejoradas**: Precios familiares = menos fricción

### Arquitectura Técnica

#### **1. Detección de Moneda**
```typescript
// Hook personalizado para detectar y manejar moneda
function useCurrency() {
  // 1. Detección por IP (geolocalización)
  // 2. Fallback por Accept-Language headers
  // 3. Override manual por usuario
  // 4. Persistencia en localStorage
}
```

#### **2. Configuración Stripe**
```typescript
// 6 productos en Stripe Dashboard
const STRIPE_PRICES = {
  // MXN (Pesos Mexicanos)
  basic_mxn: "price_basic_69mxn",     // $69 MXN - 50 créditos
  pro_mxn: "price_pro_129mxn",        // $129 MXN - 120 créditos  
  premium_mxn: "price_premium_199mxn", // $199 MXN - 200 créditos
  
  // USD (Dólares)
  basic_usd: "price_basic_370usd",     // $3.70 USD - 50 créditos
  pro_usd: "price_pro_690usd",         // $6.90 USD - 120 créditos
  premium_usd: "price_premium_1070usd" // $10.70 USD - 200 créditos
}
```

#### **3. API Endpoints Multi-Moneda**
```
POST /api/credits/purchase
• Recibe: plan + currency
• Crea: Stripe checkout session en moneda correcta
• Retorna: URL de checkout

POST /api/stripe/webhooks  
• Maneja: payment_intent.succeeded para MXN y USD
• Actualiza: créditos del usuario en base de datos
• Crea: registro en CreditTransaction
```

#### **4. UX de Precios**
- **Precio principal**: Moneda detectada (texto grande)
- **Precio secundario**: Otra moneda (texto pequeño)
- **Ejemplo para México**: "$129 MXN ($6.90 USD)"
- **Ejemplo para USA**: "$6.90 USD ($129 MXN)"

### Flujo Técnico Completo

1. **Usuario llega al sitio**
   ```
   IP → Geolocalización → País → Moneda preferida
   ```

2. **UI se actualiza dinámicamente**
   ```
   Pricing cards muestran precios en moneda detectada
   ```

3. **Usuario hace clic en "Comprar"**
   ```
   Frontend → API → Stripe Checkout (moneda correcta)
   ```

4. **Pago exitoso**
   ```
   Stripe → Webhook → Actualizar créditos → Usuario ve balance
   ```

### Consideraciones de Implementación

#### **Stripe Configuration**
- **Modo Test**: Para desarrollo con tarjetas de prueba
- **Webhooks**: Endpoint único maneja ambas monedas
- **Currency validation**: Validar moneda antes de crear session

#### **Database Schema**
```sql
-- CreditTransaction ya está preparado
model CreditTransaction {
  amount      Int      // Créditos agregados
  stripeSessionId String?  // Para tracking
  currency    String?  // "MXN" o "USD" 
  priceId     String?  // Stripe price ID usado
}
```

#### **Error Handling**
- **IP detection falla**: Fallback a USD
- **Stripe falla**: Mostrar error user-friendly
- **Webhook falla**: Retry mechanism

#### **Testing Strategy**
```bash
# Tarjetas de prueba Stripe
4242 4242 4242 4242  # Éxito (cualquier moneda)
4000 0000 0000 0002  # Decline
4000 0000 0000 9995  # Fondos insuficientes

# Testing multi-moneda
• VPN México → Verificar MXN pricing
• VPN USA → Verificar USD pricing  
• Cambio manual → Verificar persistencia
```

## 📊 Estado Actual del Proyecto (Día 10/28)

### ✅ **Completado (Semana 1-2):**
- **Internacionalización completa** (ES/EN/PT) con selector visual
- **Sistema de autenticación** con NextAuth.js funcional
- **Landing page responsive** con navegación multiidioma
- **Dashboard de usuario** con estadísticas básicas
- **Upload de archivos** con Cloudflare R2 y barra de progreso
- **Vista previa de CVs** subidos con detalles completos
- **Validaciones** de archivos (tipo, tamaño, formato)
- **Base de datos** Prisma con esquema completo
- **Drag & drop** completamente funcional

### 🔄 **En Progreso (Días 11-14):**
- **Sistema de créditos multi-moneda** en UI con balance real
- **Detección automática país/moneda** (IP + headers)
- **Integración Stripe completa** con 6 productos (MXN + USD)
- **Pricing dinámico** que muestra ambas monedas
- **Webhooks unificados** para procesar pagos en cualquier moneda

### ⏳ **Pendiente:**
- Mejoras de IA (General y Específica)
- Generación de PDFs con Puppeteer
- Onboarding guiado
- Deploy en producción

### 🎯 **Progreso del Roadmap: 35% (10/28 días)**

## 📝 Notas de Desarrollo

- **UX/UI Focus**: Diseño incentiva registro y conversión
- **Multiidioma**: Soporte completo ES/EN/PT con selector visual
- **Upload Optimizado**: Cloudflare R2 para máximo rendimiento
- **No-tech friendly**: Configuración simple para deployment
- **Escalable**: Arquitectura preparada para crecimiento
- **Seguro**: Validaciones y sanitización en todos los inputs

## 🌍 Expansión Internacional

### Mercados Objetivo
- **España y América Latina** (Español) - 500M+ hablantes
- **Estados Unidos y Reino Unido** (Inglés) - 1.5B+ hablantes  
- **Brasil y Portugal** (Portugués) - 280M+ hablantes

### SEO Internacional
- URLs localizadas por idioma
- Meta tags traducidos
- Contenido optimizado por región
- Hreflang tags implementados

## 🤝 Contribución

Este es un proyecto en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama feature
3. Realiza tus cambios (incluyendo traducciones si es necesario)
4. Envía un pull request

### Contribuir con Traducciones
1. Duplicar `messages/es.json` → `messages/[idioma].json`
2. Traducir todas las claves manteniendo la estructura
3. Agregar el idioma a `LanguageSelector` component
4. Testear la funcionalidad completa

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

---

**Desarrollado con ❤️ para mejorar oportunidades profesionales a nivel global**