'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/hooks/use-translations"
import Link from "next/link"
import { ArrowRight, Sparkles, FileText, Zap } from "lucide-react"

export function HeroSection() {
  const { t, isLoading } = useTranslations()

  if (isLoading) {
    return (
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mb-6 mx-auto"></div>
          <div className="h-20 w-full max-w-4xl bg-gray-200 animate-pulse rounded mb-6 mx-auto"></div>
          <div className="h-6 w-full max-w-3xl bg-gray-200 animate-pulse rounded mb-8 mx-auto"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        <Badge variant="secondary" className="mb-6">
          <Sparkles className="w-4 h-4 mr-2" />
          {t('hero.badge')}
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-600 bg-clip-text text-transparent">
          {t('hero.title')}
          <br />
          <span className="text-blue-600">{t('hero.titleHighlight')}</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {t('hero.description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="text-lg px-8" asChild>
            <Link href="/auth/signup">
              {t('hero.startAnalysis')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            {t('hero.viewSample')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="flex flex-col items-center p-6 rounded-lg bg-blue-50">
            <FileText className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">{t('hero.step1.title')}</h3>
            <p className="text-gray-600 text-center">{t('hero.step1.description')}</p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-lg bg-purple-50">
            <Sparkles className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="font-semibold mb-2">{t('hero.step2.title')}</h3>
            <p className="text-gray-600 text-center">{t('hero.step2.description')}</p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-lg bg-green-50">
            <Zap className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="font-semibold mb-2">{t('hero.step3.title')}</h3>
            <p className="text-gray-600 text-center">{t('hero.step3.description')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}