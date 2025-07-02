'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/hooks/use-translations"
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import { Check, Star, CreditCard, Cpu } from "lucide-react"
import Link from "next/link"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export function PricingSection() {
  const { t, isLoading } = useTranslations()

  if (isLoading) {
    return (
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4 mx-auto"></div>
            <div className="h-10 w-96 bg-gray-200 animate-pulse rounded mb-4 mx-auto"></div>
            <div className="h-6 w-full max-w-2xl bg-gray-200 animate-pulse rounded mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }

  const plans = [
    {
      name: t('pricing.starter.name'),
      price: t('pricing.starter.price'),
      credits: 50,
      popular: false,
      description: t('pricing.starter.description'),
      features: t('pricing.starter.features', []).split ? t('pricing.starter.features') : [
        "50 créditos incluidos",
        "Mejoras generales de currículum",
        "Optimización ATS",
        "Descarga en PDF",
        "Soporte por email"
      ]
    },
    {
      name: t('pricing.professional.name'),
      price: t('pricing.professional.price'),
      credits: 150,
      popular: true,
      description: t('pricing.professional.description'),
      features: t('pricing.professional.features', []).split ? t('pricing.professional.features') : [
        "150 créditos incluidos",
        "Mejoras generales + específicas",
        "Múltiples versiones de currículum",
        "Procesamiento prioritario",
        "Análisis ATS avanzado",
        "Soporte prioritario"
      ]
    },
    {
      name: t('pricing.premium.name'),
      price: t('pricing.premium.price'),
      credits: 500,
      popular: false,
      description: t('pricing.premium.description'),
      features: t('pricing.premium.features', []).split ? t('pricing.premium.features') : [
        "500 créditos incluidos",
        "Análisis ilimitado de currículum",
        "Plantillas personalizadas",
        "Procesamiento en lote",
        "Acceso a API",
        "Soporte dedicado"
      ]
    }
  ]

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
          <p className="font-space-grotesk text-xl text-[#6B6B6B] font-medium max-w-3xl mx-auto">
            <strong className="text-[#D97706]">$24.99 puede cambiar tu carrera para siempre.</strong> Es menos de lo que gastas en Netflix, 
            pero puede conseguirte un aumento de $10,000 al año. ¿Cuál es la mejor inversión?
          </p>
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
                  <span className="font-pixelify-sans text-4xl font-bold text-[#D97706]">{plan.price}</span>
                  <span className="font-space-grotesk text-[#6B6B6B] ml-2 font-medium">{t('pricing.oneTime')}</span>
                </div>
                <p className="font-space-grotesk text-[#6B6B6B] font-medium">{plan.description}</p>
              </div>
              
              <div className="text-center mb-8">
                <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] p-4 mb-6 rounded-xl">
                  <span className="font-pixelify-sans text-3xl font-bold text-[#1A1A1A]">{plan.credits}</span>
                  <span className="font-space-grotesk text-[#6B6B6B] ml-2 font-medium">{t('pricing.credits')}</span>
                </div>
                
                <ul className="space-y-3 text-left">
                  {Array.isArray(plan.features) ? plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-[#059669] mr-3 flex-shrink-0" />
                      <span className="font-space-grotesk text-[#1A1A1A] font-medium">{feature}</span>
                    </li>
                  )) : null}
                </ul>
              </div>
              
              <div className="mt-8">
                <Link href="/auth/signup">
                  <button 
                    className={`font-space-grotesk w-full py-3 text-lg font-bold transition-all rounded-xl ${
                      plan.popular 
                        ? 'bg-[#D97706] text-white hover:bg-[#B45309]' 
                        : 'bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                    }`}
                  >
                    {t('pricing.getStarted')}
                  </button>
                </Link>
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