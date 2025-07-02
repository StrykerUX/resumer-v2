'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/hooks/use-translations"
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import Link from "next/link"
import { ArrowRight, Sparkles, FileText, Zap, Brain, Target, Cpu } from "lucide-react"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

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
    <section className={`${pixelifySans.variable} ${spaceGrotesk.variable} bg-[#F7F7F5] text-[#1A1A1A] min-h-screen relative overflow-hidden pt-24 pb-20`}>
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

      <div className="relative z-10 w-[95%] mx-auto pt-20" style={{maxWidth: '1540px'}}>
        <div className="text-center">
          {/* Badge simple y claro */}
          <p className="text-sm text-[#6B6B6B] font-medium mb-16 flex items-center justify-center">
            <Cpu className="w-3 h-3 mr-2 text-[#D97706]" />
            Mejora tu currículum con IA
          </p>

          {/* Título estilo startup */}
          <h1 className="font-pixelify-sans text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-12" style={{ textWrap: 'pretty' }}>
            <span className="text-[#1A1A1A] block">TU CV OPTIMIZADO</span>
            <span className="text-[#1A1A1A] block">POR</span>
            <span className="text-[#D97706] block">INTELIGENCIA ARTIFICIAL</span>
          </h1>

          {/* Mensaje directo y realista */}
          <div className="max-w-3xl mx-auto mb-20">
            <p className="font-space-grotesk text-xl md:text-2xl font-medium text-[#6B6B6B] leading-relaxed">
              Inteligencia artificial que optimiza tu currículum para conseguir más entrevistas. 
              <strong className="text-[#D97706]"> Simple, rápido, efectivo.</strong>
            </p>
          </div>

          {/* CTAs impactantes y concisos */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
            <Link href="/auth/signup">
              <button className="font-space-grotesk bg-[#D97706] text-white px-12 py-5 text-xl font-bold hover:bg-[#B45309] transition-all flex items-center rounded-2xl" style={{boxShadow: '0 2px 4px rgba(217,151,6,0.15), 0 8px 16px rgba(217,151,6,0.1)'}}>
                Empezar Gratis
                <ArrowRight className="w-6 h-6 ml-3" />
              </button>
            </Link>
            <button className="font-space-grotesk bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] px-12 py-5 text-xl font-bold hover:bg-[#1A1A1A] hover:text-white transition-all rounded-2xl" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.08), 0 4px 12px rgba(26,26,26,0.05)'}}>
              Ver Demo
            </button>
          </div>

          {/* Proceso simple y claro */}
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto mb-20">
            <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#D97706] transition-all rounded-2xl hover:shadow-[0_2px_8px_rgba(217,151,6,0.1),0_8px_24px_rgba(217,151,6,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
              <div className="w-12 h-12 bg-[#D97706] mb-6 flex items-center justify-center mx-auto rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-3">1. SUBIR CV</h3>
              <p className="font-space-grotesk text-[#6B6B6B] leading-relaxed font-medium">
                Arrastra tu currículum actual. Aceptamos PDF, Word o imágenes.
              </p>
            </div>
            
            <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#DC2626] transition-all rounded-2xl hover:shadow-[0_2px_8px_rgba(220,38,38,0.1),0_8px_24px_rgba(220,38,38,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
              <div className="w-12 h-12 bg-[#DC2626] mb-6 flex items-center justify-center mx-auto rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-3">2. IA OPTIMIZA</h3>
              <p className="font-space-grotesk text-[#6B6B6B] leading-relaxed font-medium">
                Nuestra IA analiza y mejora el contenido, formato y palabras clave.
              </p>
            </div>
            
            <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#059669] transition-all rounded-2xl hover:shadow-[0_2px_8px_rgba(5,150,105,0.1),0_8px_24px_rgba(5,150,105,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
              <div className="w-12 h-12 bg-[#059669] mb-6 flex items-center justify-center mx-auto rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-3">3. DESCARGAR</h3>
              <p className="font-space-grotesk text-[#6B6B6B] leading-relaxed font-medium">
                Obtienes un CV profesional optimizado para sistemas ATS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}