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
- Procesamiento seguro de documentos
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

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React con TypeScript
- **Tailwind CSS** - Styling utilitario
- **Shadcn/ui** - Componentes UI modernos
- **React Hook Form** - Gestión de formularios
- **Framer Motion** - Animaciones fluidas

### Backend
- **Next.js API Routes** - API integrada
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **NextAuth.js** - Autenticación

### Servicios Externos
- **OpenAI API** - Procesamiento de texto con IA
- **Stripe** - Procesamiento de pagos
- **Uploadthing** - Gestión de archivos
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
│   │   ├── auth/           # Páginas de autenticación
│   │   ├── dashboard/      # Dashboard del usuario
│   │   └── page.tsx        # Landing page
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/            # Componentes base
│   │   ├── forms/         # Formularios
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilidades y configuración
│   │   ├── auth.ts        # Configuración NextAuth
│   │   ├── db.ts          # Configuración Prisma
│   │   ├── openai.ts      # Cliente OpenAI
│   │   └── stripe.ts      # Configuración Stripe
│   └── types/             # Definiciones TypeScript
├── prisma/                # Schema y migraciones
├── public/                # Archivos estáticos
├── docker/                # Configuración Docker
└── docs/                  # Documentación
```

## 🚀 Roadmap de Desarrollo (4 Semanas)

### **Semana 1: Base Funcional Visible** 
**Días 1-3: Setup + Landing Funcional**
- [x] Setup inicial del proyecto
- [ ] Next.js 14 + TypeScript + Tailwind
- [ ] Landing page completa + navegación
- [ ] Formulario de registro funcional
- [ ] Diseño responsive mobile/desktop
- **🎯 PREVIEW 1**: Landing navegable + registro visual

**Días 4-7: Autenticación Completa**
- [ ] Configuración NextAuth.js
- [ ] Sistema login/registro funcionando  
- [ ] Dashboard básico del usuario
- [ ] Setup Prisma + PostgreSQL
- **🎯 PREVIEW 2**: Flujo completo landing → registro → dashboard

---

### **Semana 2: Funcionalidades Core Visibles**
**Días 8-10: Upload + Vista Previa**
- [ ] Integración UploadThing
- [ ] Drag & drop de archivos funcionando
- [ ] Procesamiento PDF/Word/JPG 
- [ ] Validaciones visuales de archivos
- **🎯 PREVIEW 3**: Subir archivos reales + confirmaciones

**Días 11-14: Créditos + Pagos Funcionales**
- [ ] Sistema de créditos en UI
- [ ] Integración completa con Stripe
- [ ] Comprar créditos (modo test)
- [ ] Balance actualizado en tiempo real
- **🎯 PREVIEW 4**: Comprar créditos + ver balance

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

### Después del Día 3:
✅ **Podrás probar:**
- Navegar la landing page completa
- Registrarte como usuario nuevo
- Ver el dashboard básico funcionando

### Después del Día 7:
✅ **Podrás probar:**
- Flujo completo de registro/login
- Dashboard con navegación funcional
- Perfil de usuario básico

### Después del Día 10:
✅ **Podrás probar:**
- Subir archivos PDF/Word/JPG reales
- Ver confirmaciones visuales del upload
- Probar validaciones de formato/tamaño

### Después del Día 14:
✅ **Podrás probar:**
- Comprar créditos con tarjeta de prueba Stripe
- Ver balance de créditos actualizado
- Probar restricciones por falta de créditos

### Después del Día 17:
✅ **Podrás probar:**
- Subir CV real → recibir análisis completo de IA
- Completar cuestionario interactivo
- Ver recomendaciones personalizadas detalladas

### Después del Día 21:
✅ **Podrás probar:**
- Proceso completo: Mejora General (gastar 10 créditos)
- Proceso completo: Mejora Específica con job posting
- Ver preview detallado antes de confirmar descarga

### Después del Día 24:
✅ **Podrás probar:**
- Descargar PDF real mejorado y funcional
- Completar onboarding desde cero como nuevo usuario
- Experiencia completa optimizada para mobile

### Después del Día 28:
✅ **Podrás probar:**
- Acceder desde cualquier dispositivo
- Probar con usuarios reales (beta testing)
- Producto completamente funcional y escalable

## 💰 Modelo de Negocio

### Sistema de Créditos
- **Registro gratuito**: 5 créditos de bienvenida
- **Mejora general**: 10 créditos
- **Mejora específica**: 15 créditos
- **Paquetes de créditos**:
  - Básico: 50 créditos - $9.99
  - Pro: 150 créditos - $24.99
  - Premium: 500 créditos - $69.99

## 🎯 Flujo de Usuario

1. **Landing** → Registro incentivado
2. **Registro** → Onboarding
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
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
UPLOADTHING_SECRET=
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
```

## 📝 Notas de Desarrollo

- **UX/UI Focus**: Diseño incentiva registro y conversión
- **No-tech friendly**: Configuración simple para deployment
- **Escalable**: Arquitectura preparada para crecimiento
- **Seguro**: Validaciones y sanitización en todos los inputs

## 🤝 Contribución

Este es un proyecto en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama feature
3. Realiza tus cambios
4. Envía un pull request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

---

**Desarrollado con ❤️ para mejorar oportunidades profesionales**