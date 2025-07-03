'use client'

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/hooks/use-currency"
import { PRICE_CONFIG } from "@/lib/stripe-client"
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import { Check, Star, CreditCard, Globe, Loader2 } from "lucide-react"
import Link from "next/link"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export function PricingSectionClient() {
  const { data: session } = useSession()
  const { currency, setCurrency, isLoading: currencyLoading, formatPrice } = useCurrency()
  const [loadingPurchase, setLoadingPurchase] = useState<string | null>(null)

  // Función para manejar la compra (si está logueado, compra directa; si no, registrarse)
  const handlePurchase = async (planKey: 'basic' | 'pro' | 'premium') => {
    if (!session) {
      // Si no está logueado, ir a registro
      window.location.href = '/auth/signup'
      return
    }

    try {
      setLoadingPurchase(planKey)
      console.log('🛒 Starting purchase from landing:', { planKey, currency })

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

  const plans = [
    {
      name: 'Básico',
      planKey: 'basic' as const,
      credits: PRICE_CONFIG.basic.credits,
      popular: false,
      description: 'Perfecto para comenzar a mejorar tu currículum',
      features: [
        `${PRICE_CONFIG.basic.credits} créditos incluidos`,
        "Mejoras generales de currículum",
        "Optimización ATS",
        "Descarga en PDF",
        "Soporte por email"
      ]
    },
    {
      name: 'Profesional',
      planKey: 'pro' as const,
      credits: PRICE_CONFIG.pro.credits,
      popular: true,
      description: 'Ideal para profesionales que buscan destacar',
      features: [
        `${PRICE_CONFIG.pro.credits} créditos incluidos`,
        "Mejoras generales + específicas",
        "Múltiples versiones de currículum",
        "Procesamiento prioritario",
        "Análisis ATS avanzado",
        "Soporte prioritario"
      ]
    },
    {
      name: 'Premium',
      planKey: 'premium' as const,
      credits: PRICE_CONFIG.premium.credits,
      popular: false,
      description: 'Para uso intensivo y equipos',
      features: [
        `${PRICE_CONFIG.premium.credits} créditos incluidos`,
        "Análisis ilimitado de currículum",
        "Plantillas personalizadas",
        "Procesamiento en lote",
        "Acceso a API",
        "Soporte dedicado"
      ]
    }
  ]

  if (currencyLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
      </div>
    )
  }

  return (
    <section id="pricing" className={`${pixelifySans.variable} ${spaceGrotesk.variable} py-20 px-4 bg-white text-[#1A1A1A]`}>
      <div className="w-[95%] mx-auto" style={{maxWidth: '1540px'}}>
        <div className="text-center mb-16">
          <p className="text-sm text-[#6B6B6B] font-medium mb-6 flex items-center justify-center">
            <CreditCard className="w-3 h-3 mr-2 text-[#D97706]" />
            Inversión que se Paga Sola
          </p>
          <h2 className="font-pixelify-sans text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
            UN CAFÉ VS. UN MEJOR SALARIO
          </h2>
          <p className="font-space-grotesk text-xl text-[#6B6B6B] font-medium max-w-3xl mx-auto mb-8">
            <strong className="text-[#D97706]">{formatPrice(currency === 'MXN' ? 69 : 3.70)} puede cambiar tu carrera para siempre.</strong> Es menos de lo que gastas en Netflix, 
            pero puede conseguirte un aumento de $10,000 al año. ¿Cuál es la mejor inversión?
          </p>
          
          {/* Currency Selector */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#6B6B6B]" />
              <span className="font-space-grotesk text-sm font-medium text-[#6B6B6B]">Moneda:</span>
            </div>
            <div className="flex bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-xl overflow-hidden">
              <button
                onClick={() => setCurrency('MXN')}
                className={`px-4 py-2 text-sm font-bold transition-all ${
                  currency === 'MXN' 
                    ? 'bg-[#D97706] text-white' 
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                🇲🇽 MXN
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2 text-sm font-bold transition-all ${
                  currency === 'USD' 
                    ? 'bg-[#D97706] text-white' 
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                🇺🇸 USD
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white border-2 ${plan.popular ? 'border-[#D97706] scale-105' : 'border-[#E5E5E5]'} p-8 hover:border-[#D97706] transition-all rounded-2xl hover:shadow-[0_4px_16px_rgba(217,151,6,0.12),0_12px_32px_rgba(217,151,6,0.08)]`} style={{boxShadow: plan.popular ? '0 4px 16px rgba(217,151,6,0.15), 0 16px 48px rgba(217,151,6,0.1)' : '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
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
                <h3 className="font-pixelify-sans text-2xl font-bold text-[#1A1A1A] mb-4">{plan.name.toUpperCase()}</h3>
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
                <button 
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
                  {loadingPurchase === plan.planKey ? 'Procesando...' : (session ? 'Comprar Ahora' : 'Comenzar Ahora')}
                </button>
                <div className="mt-2 text-center">
                  <span className="font-space-grotesk text-xs text-[#6B6B6B]">
                    {session ? 'Pago seguro con Stripe' : 'Registro gratuito + 5 créditos'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] p-8 max-w-3xl mx-auto rounded-2xl" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
            <div className="w-12 h-12 bg-[#059669] mb-4 flex items-center justify-center mx-auto rounded-xl">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-4">
              PRUÉBALO GRATIS AHORA MISMO
            </h3>
            <p className="font-space-grotesk text-[#6B6B6B] font-medium mb-4">
              <strong className="text-[#D97706]">5 créditos gratuitos</strong> para que veas la diferencia antes de invertir. 
              Si no quedas sorprendido con los resultados, te devolvemos el dinero.
            </p>
            <p className="font-space-grotesk text-sm text-[#6B6B6B]">
              <strong>Garantía del 100%:</strong> Si tu nuevo CV no mejora tus respuestas en 30 días, 
              reembolso completo sin preguntas.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}