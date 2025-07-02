'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/hooks/use-translations"
import { Check, Star } from "lucide-react"
import Link from "next/link"

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
    <section id="pricing" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">{t('pricing.badge')}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('pricing.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    {t('pricing.mostPopular')}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{t('pricing.oneTime')}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-2xl font-bold text-blue-600">{plan.credits}</span>
                  <span className="text-gray-600 ml-2">{t('pricing.credits')}</span>
                </div>
                
                <ul className="space-y-3">
                  {Array.isArray(plan.features) ? plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  )) : null}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/auth/signup">
                    {t('pricing.getStarted')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            🎉 <strong>{t('pricing.freeCredits')}</strong>
          </p>
          <p className="text-sm text-gray-500">
            {t('pricing.guarantee')}
          </p>
        </div>
      </div>
    </section>
  )
}