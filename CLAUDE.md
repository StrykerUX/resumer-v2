# Claude Code Configuration - Resumer-v2

## Project Overview
Resumer-v2 es una webapp de Resume Enhancer que utiliza IA para mejorar CVs. Stack: Next.js 14, TypeScript, Tailwind, PostgreSQL, Prisma, OpenAI, Stripe.

## Development Commands

### Setup y Instalación
```bash
# Instalar dependencias
npm install

# Setup inicial de la base de datos
npx prisma migrate dev --name init

# Generar cliente Prisma
npx prisma generate

# Seed inicial (opcional)
npx prisma db seed
```

### Desarrollo
```bash
# Ejecutar en modo desarrollo
npm run dev

# Ejecutar con debugging
npm run dev:debug

# Build para verificar errores
npm run build

# Lint y format
npm run lint
npm run lint:fix
npm run format
```

### Base de Datos
```bash
# Crear nueva migración
npx prisma migrate dev --name [nombre-migracion]

# Reset de base de datos
npx prisma migrate reset

# Ver base de datos en Prisma Studio
npx prisma studio

# Push schema sin migración (desarrollo)
npx prisma db push
```

### Testing
```bash
# Ejecutar tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests E2E
npm run test:e2e
```

### Docker y Deploy
```bash
# Build imagen Docker
docker build -t resumer-v2 .

# Ejecutar contenedor local
docker run -p 3000:3000 resumer-v2

# Docker compose para desarrollo
docker-compose up -d

# Deploy a Dokploy
npm run deploy
```

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Endpoints de autenticación
│   │   ├── credits/      # Gestión de créditos
│   │   ├── upload/       # Upload de archivos
│   │   ├── analyze/      # Análisis de CV
│   │   └── stripe/       # Webhooks de Stripe
│   ├── auth/             # Páginas de autenticación
│   ├── dashboard/        # Dashboard del usuario
│   ├── onboarding/       # Proceso de onboarding
│   └── page.tsx          # Landing page
├── components/           # Componentes React
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── forms/           # Formularios específicos
│   ├── layout/          # Componentes de layout
│   └── features/        # Componentes por feature
├── lib/                 # Utilidades y configuración
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Prisma client
│   ├── openai.ts        # OpenAI client
│   ├── stripe.ts        # Stripe configuration
│   ├── uploadthing.ts   # File upload config
│   └── utils.ts         # Utilidades generales
├── types/               # Definiciones TypeScript
└── hooks/               # Custom React hooks
```

## Key Files to Know

### Configuration Files
- `next.config.js` - Configuración Next.js
- `tailwind.config.js` - Configuración Tailwind
- `prisma/schema.prisma` - Esquema de base de datos
- `.env.local` - Variables de entorno
- `tsconfig.json` - Configuración TypeScript

### Core Features
- `src/lib/auth.ts` - Configuración de autenticación
- `src/lib/openai.ts` - Integración con OpenAI
- `src/lib/stripe.ts` - Configuración de pagos
- `src/app/api/analyze/route.ts` - Análisis de CV
- `src/app/api/stripe/route.ts` - Webhooks de Stripe

## Environment Variables

### Required
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/resumer_v2"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# UploadThing
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"
```

### Optional
```env
# Development
NODE_ENV="development"
VERCEL_URL="your-vercel-url"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

## Database Schema

### Core Tables
- `User` - Información de usuarios
- `Account` - Cuentas de OAuth
- `Session` - Sesiones de usuario
- `Credit` - Transacciones de créditos
- `Resume` - CVs subidos
- `Analysis` - Análisis de IA
- `Enhancement` - Mejoras generadas

## API Endpoints

### Authentication
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/signin` - Inicio de sesión
- `POST /api/auth/signout` - Cerrar sesión

### Credits & Payments
- `GET /api/credits` - Obtener balance de créditos
- `POST /api/credits/purchase` - Comprar créditos
- `POST /api/stripe/webhooks` - Webhooks de Stripe

### Resume Processing
- `POST /api/upload` - Subir archivo de CV
- `POST /api/analyze` - Analizar CV con IA
- `POST /api/enhance/general` - Mejora general
- `POST /api/enhance/targeted` - Mejora específica
- `GET /api/download/[id]` - Descargar PDF mejorado

## Common Tasks

### Adding New Feature
1. Crear componentes en `src/components/features/`
2. Añadir API routes en `src/app/api/`
3. Actualizar schema de Prisma si es necesario
4. Crear tests correspondientes
5. Actualizar documentación

### Database Changes
1. Modificar `prisma/schema.prisma`
2. Ejecutar `npx prisma migrate dev --name [nombre]`
3. Actualizar tipos TypeScript
4. Ejecutar `npx prisma generate`

### Debugging
- Usar `console.log` para debugging rápido
- Prisma Studio para inspeccionar base de datos
- Network tab para verificar API calls
- React DevTools para componentes

## Performance Considerations
- Usar `next/image` para optimización de imágenes
- Implementar lazy loading para componentes pesados
- Cache de API responses donde sea apropiado
- Optimizar queries de Prisma con `include` y `select`

## Security Notes
- Validar todos los inputs del usuario
- Sanitizar archivos subidos
- Rate limiting en APIs sensibles
- Validar tokens de autenticación
- No exponer claves API en el frontend

## Deployment on Dokploy
1. Configurar variables de entorno en Dokploy
2. Usar `Dockerfile` incluido en el proyecto
3. Configurar PostgreSQL en el VPS
4. Ejecutar migraciones en producción
5. Configurar dominio y SSL

## Troubleshooting

### Common Issues
- **Prisma client not generated**: Ejecutar `npx prisma generate`
- **Database connection error**: Verificar `DATABASE_URL`
- **NextAuth error**: Verificar `NEXTAUTH_SECRET` y `NEXTAUTH_URL`
- **Stripe webhook error**: Verificar `STRIPE_WEBHOOK_SECRET`
- **OpenAI rate limit**: Implementar retry logic

### Logs to Check
- Next.js console output
- Prisma query logs
- Stripe dashboard logs
- UploadThing dashboard
- Browser network tab