'use client'

import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslations } from "@/hooks/use-translations"
import Link from "next/link"

export function Navigation() {
  const { t, isLoading } = useTranslations()

  if (isLoading) {
    return (
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Resumer<span className="text-blue-600">-v2</span>
          </Link>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          Resumer<span className="text-blue-600">-v2</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
            {t('navigation.features')}
          </Link>
          <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
            {t('navigation.pricing')}
          </Link>
          <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
            {t('navigation.howItWorks')}
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <Button variant="outline" asChild>
            <Link href="/auth/signin">{t('navigation.signIn')}</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">{t('navigation.getStarted')}</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}