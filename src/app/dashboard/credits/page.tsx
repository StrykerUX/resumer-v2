'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCredits } from '@/hooks/use-credits'
import { useCurrency } from '@/hooks/use-currency'
import { PRICE_CONFIG } from '@/lib/stripe-client'
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import { Loader2, CreditCard, ArrowLeft, Globe, Star, Check } from 'lucide-react'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export default function CreditsPage() {
  const { data: session, status } = useSession()
  const { credits, isLoading: creditsLoading, refreshCredits } = useCredits()
  const { currency, setCurrency, formatPrice } = useCurrency()
  const router = useRouter()
  const [loadingPurchase, setLoadingPurchase] = useState<string | null>(null)

  // Función para manejar la compra
  const handlePurchase = async (planKey: 'basic' | 'pro' | 'premium') => {
    try {
      setLoadingPurchase(planKey)
      console.log('🛒 Starting purchase:', { planKey, currency })

      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planKey,
          currency: currency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en la compra')
      }

      console.log('✅ Purchase API response:', data)

      // Redirigir a Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No se recibió URL de checkout')
      }

    } catch (error) {
      console.error('❌ Purchase error:', error)
      alert(`Error al procesar la compra: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoadingPurchase(null)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const plans = [
    {
      name: 'Básico',
      planKey: 'basic' as const,
      credits: PRICE_CONFIG.basic.credits,
      popular: false,
      description: 'Perfecto para comenzar',
      features: [
        `${PRICE_CONFIG.basic.credits} créditos incluidos`,
        "5 mejoras de currículum",
        "Análisis ATS básico",
        "Soporte por email"
      ]
    },
    {
      name: 'Profesional',
      planKey: 'pro' as const,
      credits: PRICE_CONFIG.pro.credits,
      popular: true,
      description: 'Más popular para profesionales',
      features: [
        `${PRICE_CONFIG.pro.credits} créditos incluidos`,
        "12 mejoras de currículum",
        "Análisis ATS avanzado",
        "Soporte prioritario"
      ]
    },
    {
      name: 'Premium',
      planKey: 'premium' as const,
      credits: PRICE_CONFIG.premium.credits,
      popular: false,
      description: 'Para uso intensivo',
      features: [
        `${PRICE_CONFIG.premium.credits} créditos incluidos`,
        "20 mejoras de currículum",
        "Análisis ilimitado",
        "Soporte dedicado"
      ]
    }
  ]

  return (
    <div className={`${pixelifySans.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F7F7F5] text-[#1A1A1A]`}>
      {/* Header */}
      <header className="bg-white border-b-2 border-[#E5E5E5]">
        <div className="w-[95%] mx-auto py-4 flex items-center justify-between" style={{maxWidth: '1540px'}}>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="font-space-grotesk text-[#6B6B6B] hover:text-[#1A1A1A]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="font-space-grotesk text-sm text-[#6B6B6B] font-medium">
              Créditos actuales: <span className="font-bold text-[#D97706]">{creditsLoading ? '...' : credits}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[95%] mx-auto py-12" style={{maxWidth: '1540px'}}>
        <div className="text-center mb-12">
          <h1 className="font-pixelify-sans text-4xl font-bold text-[#1A1A1A] mb-4">
            COMPRAR CRÉDITOS
          </h1>
          <p className="font-space-grotesk text-lg text-[#6B6B6B] font-medium max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades y mejora tu currículum con IA
          </p>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#6B6B6B]" />
            <span className="font-space-grotesk text-sm font-medium text-[#6B6B6B]">Moneda:</span>
          </div>
          <div className="flex bg-white border-2 border-[#E5E5E5] rounded-xl overflow-hidden">
            <button
              onClick={() => setCurrency('MXN')}
              className={`px-6 py-3 text-sm font-bold transition-all ${
                currency === 'MXN' 
                  ? 'bg-[#D97706] text-white' 
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`}
            >
              🇲🇽 Pesos Mexicanos
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-6 py-3 text-sm font-bold transition-all ${
                currency === 'USD' 
                  ? 'bg-[#D97706] text-white' 
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`}
            >
              🇺🇸 Dólares
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative bg-white border-2 ${plan.popular ? 'border-[#D97706] scale-105' : 'border-[#E5E5E5]'} p-8 hover:border-[#D97706] transition-all rounded-2xl`}
              style={{boxShadow: plan.popular ? '0 4px 16px rgba(217,151,6,0.15), 0 16px 48px rgba(217,151,6,0.1)' : '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#D97706] text-white px-6 py-2 text-sm font-bold flex items-center rounded-xl">
                    <Star className="w-4 h-4 mr-2" />
                    MÁS POPULAR
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <div className={`w-12 h-12 ${plan.popular ? 'bg-[#D97706]' : 'bg-[#1A1A1A]'} mb-6 flex items-center justify-center mx-auto rounded-xl`}>
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-pixelify-sans text-2xl font-bold text-[#1A1A1A] mb-4">{plan.name}</h3>
                <div className="mb-4">
                  <span className="font-pixelify-sans text-4xl font-bold text-[#D97706]">
                    {formatPrice(PRICE_CONFIG[plan.planKey][currency.toLowerCase() as 'mxn' | 'usd'].amount)}
                  </span>
                  <span className="font-space-grotesk text-[#6B6B6B] ml-2 font-medium">pago único</span>
                </div>
                <p className="font-space-grotesk text-[#6B6B6B] font-medium">{plan.description}</p>
              </div>
              
              <div className="text-center mb-8">
                <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] p-4 mb-6 rounded-xl">
                  <span className="font-pixelify-sans text-3xl font-bold text-[#1A1A1A]">{plan.credits}</span>
                  <span className="font-space-grotesk text-[#6B6B6B] ml-2 font-medium">créditos</span>
                </div>
                
                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-[#059669] mr-3 flex-shrink-0" />
                      <span className="font-space-grotesk text-[#1A1A1A] font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8">
                <Button 
                  className={`font-space-grotesk w-full py-3 text-lg font-bold transition-all rounded-xl ${
                    plan.popular 
                      ? 'bg-[#D97706] text-white hover:bg-[#B45309]' 
                      : 'bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                  }`}
                  onClick={() => handlePurchase(plan.planKey)}
                  disabled={loadingPurchase === plan.planKey}
                >
                  {loadingPurchase === plan.planKey ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  {loadingPurchase === plan.planKey ? 'Procesando...' : 'Comprar Ahora'}
                </Button>
                <div className="mt-2 text-center">
                  <span className="font-space-grotesk text-xs text-[#6B6B6B]">
                    Pago seguro con Stripe
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="text-center mt-16">
          <div className="bg-white border-2 border-[#E5E5E5] p-8 max-w-3xl mx-auto rounded-2xl">
            <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-4">
              ¿CÓMO FUNCIONAN LOS CRÉDITOS?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-space-grotesk font-bold text-[#1A1A1A] mb-2">💡 Mejora General</h4>
                <p className="font-space-grotesk text-[#6B6B6B] font-medium text-sm">
                  10 créditos - Análisis completo y mejoras generales de tu CV
                </p>
              </div>
              <div>
                <h4 className="font-space-grotesk font-bold text-[#1A1A1A] mb-2">🎯 Mejora Específica</h4>
                <p className="font-space-grotesk text-[#6B6B6B] font-medium text-sm">
                  15 créditos - Optimización para una posición específica
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}