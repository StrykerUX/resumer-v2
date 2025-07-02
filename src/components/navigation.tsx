'use client'

import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslations } from "@/hooks/use-translations"
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import { Cpu } from "lucide-react"
import Link from "next/link"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export function Navigation() {
  const { t, isLoading } = useTranslations()

  if (isLoading) {
    return (
      <nav className={`${pixelifySans.variable} ${spaceGrotesk.variable} fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%]`} style={{maxWidth: '1540px'}}>
        <div className="bg-white/90 backdrop-blur-md border-2 border-[#E5E5E5] rounded-2xl px-6 py-4" style={{boxShadow: '0 2px 8px rgba(26,26,26,0.08), 0 12px 32px rgba(26,26,26,0.06)'}}>
          <div className="flex items-center justify-between">
            <Link href="/" className="font-pixelify-sans text-2xl font-bold text-[#1A1A1A] flex items-center">
              <Cpu className="w-6 h-6 text-[#D97706] mr-2" />
              RESUMER<span className="text-[#D97706]">-V2</span>
            </Link>
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-xl"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`${pixelifySans.variable} ${spaceGrotesk.variable} fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%]`} style={{maxWidth: '1540px'}}>
      <div className="bg-white/90 backdrop-blur-md border-2 border-[#E5E5E5] rounded-2xl px-6 py-4 hover:border-[#D97706] transition-all duration-300" style={{boxShadow: '0 2px 8px rgba(26,26,26,0.08), 0 12px 32px rgba(26,26,26,0.06)'}}>
        <div className="flex items-center justify-between">
          <Link href="/" className="font-pixelify-sans text-2xl font-bold text-[#1A1A1A] flex items-center hover:text-[#D97706] transition-colors">
            <Cpu className="w-6 h-6 text-[#D97706] mr-2" />
            RESUMER<span className="text-[#D97706]">-V2</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="font-space-grotesk text-[#6B6B6B] hover:text-[#D97706] transition-colors font-medium">
              {t('navigation.features')}
            </Link>
            <Link href="#pricing" className="font-space-grotesk text-[#6B6B6B] hover:text-[#D97706] transition-colors font-medium">
              {t('navigation.pricing')}
            </Link>
            <Link href="#how-it-works" className="font-space-grotesk text-[#6B6B6B] hover:text-[#D97706] transition-colors font-medium">
              {t('navigation.howItWorks')}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <Button variant="outline" asChild className="rounded-xl border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white font-space-grotesk font-bold transition-all">
              <Link href="/auth/signin">{t('navigation.signIn')}</Link>
            </Button>
            <Button asChild className="rounded-xl bg-[#D97706] text-white hover:bg-[#B45309] font-space-grotesk font-bold transition-all shadow-lg">
              <Link href="/auth/signup">{t('navigation.getStarted')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}