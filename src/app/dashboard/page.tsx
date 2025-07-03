'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LanguageSelector } from '@/components/language-selector'
import { useTranslations } from '@/hooks/use-translations'
import { useCredits } from '@/hooks/use-credits'
import { useCurrency } from '@/hooks/use-currency'
import { PRICE_CONFIG } from '@/lib/stripe-client'
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import { Loader2, CreditCard, FileText, Upload, BarChart3, LogOut, Cpu, Brain, AlertCircle } from 'lucide-react'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { t, isLoading: translationsLoading } = useTranslations()
  const { credits, isLoading: creditsLoading, error: creditsError, refreshCredits } = useCredits()
  const { currency, formatPrice } = useCurrency()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading' || translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className={`${pixelifySans.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F7F7F5] text-[#1A1A1A] relative overflow-hidden`}>
      {/* Grid pattern futurista de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(#D97706 1px, transparent 1px),
            linear-gradient(90deg, #D97706 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      {/* Header futurista */}
      <header className="relative z-10 bg-white border-b-2 border-[#E5E5E5]">
        <div className="w-[95%] mx-auto py-4 flex items-center justify-between" style={{maxWidth: '1540px'}}>
          <div className="flex items-center space-x-4">
            <h1 className="font-pixelify-sans text-2xl font-bold text-[#1A1A1A]">
              RESUMER<span className="text-[#D97706]">-v2</span>
            </h1>
            <div className="px-4 py-2 bg-[#D97706] text-white text-sm font-bold rounded-xl">
              <Cpu className="w-3 h-3 mr-2 inline" />
              DASHBOARD
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <div className="font-space-grotesk text-sm text-[#6B6B6B] font-medium">
              Hola, {session.user?.name || session.user?.email}
            </div>
            <Button 
              className="font-space-grotesk bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all font-bold rounded-xl" 
              size="sm" 
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-[95%] mx-auto py-8" style={{maxWidth: '1540px'}}>
        <div className="text-center mb-12">
          <p className="text-sm text-[#6B6B6B] font-medium mb-6 flex items-center justify-center">
            <Brain className="w-3 h-3 mr-2 text-[#D97706]" />
            Panel de Control Inteligente
          </p>
          <h2 className="font-pixelify-sans text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
            ¡BIENVENIDO A TU DASHBOARD!
          </h2>
          <p className="font-space-grotesk text-lg text-[#6B6B6B] font-medium max-w-3xl mx-auto">
            Desde aquí puedes gestionar tus currículums, ver tu balance de créditos y acceder a todas las funcionalidades.
          </p>
        </div>

        {/* Stats Cards con estilo futurista */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border-2 border-[#E5E5E5] p-6 hover:border-[#D97706] transition-all rounded-2xl hover:shadow-[0_2px_8px_rgba(217,151,6,0.1),0_8px_24px_rgba(217,151,6,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-space-grotesk text-sm font-bold text-[#1A1A1A]">CRÉDITOS DISPONIBLES</h3>
              <CreditCard className="h-4 w-4 text-[#D97706]" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              {creditsLoading ? (
                <Loader2 className="w-6 h-6 text-[#D97706] animate-spin" />
              ) : creditsError ? (
                <AlertCircle className="w-6 h-6 text-red-500" />
              ) : (
                <div className="font-pixelify-sans text-3xl font-bold text-[#D97706]">{credits}</div>
              )}
            </div>
            <p className="font-space-grotesk text-xs text-[#6B6B6B] font-medium">
              {creditsError ? 'Error al cargar' : credits === 5 ? 'Créditos de bienvenida' : 'Créditos disponibles'}
            </p>
            {creditsError && (
              <button 
                onClick={refreshCredits}
                className="font-space-grotesk text-xs text-[#D97706] hover:text-[#B45309] mt-1 underline"
              >
                Reintentar
              </button>
            )}
          </div>

          <div className="bg-white border-2 border-[#E5E5E5] p-6 hover:border-[#DC2626] transition-all rounded-2xl hover:shadow-[0_2px_8px_rgba(220,38,38,0.1),0_8px_24px_rgba(220,38,38,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-space-grotesk text-sm font-bold text-[#1A1A1A]">CVS SUBIDOS</h3>
              <FileText className="h-4 w-4 text-[#DC2626]" />
            </div>
            <div className="font-pixelify-sans text-3xl font-bold text-[#1A1A1A] mb-2">0</div>
            <p className="font-space-grotesk text-xs text-[#6B6B6B] font-medium">
              Sube tu primer CV
            </p>
          </div>

          <div className="bg-white border-2 border-[#E5E5E5] p-6 hover:border-[#059669] transition-all rounded-2xl hover:shadow-[0_2px_8px_rgba(5,150,105,0.1),0_8px_24px_rgba(5,150,105,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-space-grotesk text-sm font-bold text-[#1A1A1A]">ANÁLISIS REALIZADOS</h3>
              <BarChart3 className="h-4 w-4 text-[#059669]" />
            </div>
            <div className="font-pixelify-sans text-3xl font-bold text-[#1A1A1A] mb-2">0</div>
            <p className="font-space-grotesk text-xs text-[#6B6B6B] font-medium">
              Mejoras completadas
            </p>
          </div>

          <div className="bg-white border-2 border-[#E5E5E5] p-6 hover:border-[#7C3AED] transition-all rounded-2xl hover:shadow-[0_2px_8px_rgba(124,58,237,0.1),0_8px_24px_rgba(124,58,237,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-space-grotesk text-sm font-bold text-[#1A1A1A]">PUNTUACIÓN ATS</h3>
              <BarChart3 className="h-4 w-4 text-[#7C3AED]" />
            </div>
            <div className="font-pixelify-sans text-3xl font-bold text-[#1A1A1A] mb-2">--</div>
            <p className="font-space-grotesk text-xs text-[#6B6B6B] font-medium">
              Después del análisis
            </p>
          </div>
        </div>

        {/* Quick Actions con diseño futurista */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#D97706] transition-all rounded-2xl hover:shadow-[0_4px_16px_rgba(217,151,6,0.12),0_12px_32px_rgba(217,151,6,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#D97706] mb-4 flex items-center justify-center mx-auto rounded-xl">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-2">SUBIR NUEVO CV</h3>
              <p className="font-space-grotesk text-[#6B6B6B] font-medium">
                Comienza subiendo tu currículum para recibir análisis y mejoras personalizadas con IA.
              </p>
            </div>
            <Button 
              className="font-space-grotesk w-full bg-[#D97706] text-white py-3 text-lg font-bold hover:bg-[#B45309] transition-all rounded-xl"
              onClick={() => router.push('/dashboard/upload')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir CV
            </Button>
            <p className="font-space-grotesk text-xs text-[#6B6B6B] mt-2 text-center">
              Soportamos archivos PDF, Word e imágenes
            </p>
          </div>

          <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#DC2626] transition-all rounded-2xl hover:shadow-[0_4px_16px_rgba(220,38,38,0.12),0_12px_32px_rgba(220,38,38,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#DC2626] mb-4 flex items-center justify-center mx-auto rounded-xl">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-2">GESTIONAR CRÉDITOS</h3>
              <p className="font-space-grotesk text-[#6B6B6B] font-medium">
                Compra más créditos para acceder a mejoras avanzadas y análisis ilimitados.
              </p>
            </div>
            <Button 
              className="font-space-grotesk w-full bg-[#DC2626] text-white py-3 text-lg font-bold hover:bg-[#B91C1C] transition-all rounded-xl"
              onClick={() => router.push('/dashboard/credits')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Comprar Créditos
            </Button>
            <div className="font-space-grotesk text-xs text-[#6B6B6B] mt-2 text-center">
              Desde {formatPrice(PRICE_CONFIG.basic[currency.toLowerCase() as 'mxn' | 'usd'].amount)} • 50 créditos<br />
              • Mejora general: 10 créditos • Mejora específica: 15 créditos
            </div>
          </div>
        </div>

        {/* Recent Activity con estilo futurista */}
        <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#D97706] transition-all rounded-2xl hover:shadow-[0_4px_16px_rgba(217,151,6,0.12),0_12px_32px_rgba(217,151,6,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#059669] mb-4 flex items-center justify-center mx-auto rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-2">ACTIVIDAD RECIENTE</h3>
            <p className="font-space-grotesk text-[#6B6B6B] font-medium">
              Tus últimas acciones en la plataforma
            </p>
          </div>
          
          <div className="text-center py-8 text-[#6B6B6B]">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-space-grotesk font-medium">No hay actividad reciente</p>
            <p className="font-space-grotesk text-sm">Sube tu primer CV para comenzar</p>
          </div>
        </div>
      </main>
    </div>
  )
}