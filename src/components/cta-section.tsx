'use client'

import { Button } from "@/components/ui/button"
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import { ArrowRight, Sparkles, Rocket, Cpu } from "lucide-react"
import Link from "next/link"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export function CTASection() {
  return (
    <section className={`${pixelifySans.variable} ${spaceGrotesk.variable} py-20 px-4 bg-[#F7F7F5] text-[#1A1A1A] relative overflow-hidden`}>
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

      <div className="relative z-10 w-[95%] mx-auto text-center" style={{maxWidth: '1540px'}}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-sm text-[#6B6B6B] font-medium mb-6 flex items-center justify-center">
              <Cpu className="w-3 h-3 mr-2 text-[#D97706]" />
              El Momento de Actuar Es Ahora
            </p>
            <div className="w-16 h-16 bg-[#D97706] mx-auto mb-6 flex items-center justify-center rounded-xl">
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="font-pixelify-sans text-3xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-8">
            TU FUTURO PROFESIONAL EMPIEZA EN 60 SEGUNDOS
          </h2>
          
          <p className="font-space-grotesk text-xl md:text-2xl text-[#6B6B6B] font-medium mb-12 max-w-3xl mx-auto">
            <strong className="text-[#D97706]">Cada día que esperas, otro candidato consigue el trabajo que tú quieres.</strong> 
            Mientras lees esto, nuestra IA podría estar optimizando tu CV para conseguir tu próxima entrevista.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/auth/signup">
              <button className="font-space-grotesk bg-[#D97706] text-white px-12 py-5 text-xl font-bold hover:bg-[#B45309] transition-all flex items-center justify-center rounded-2xl" style={{boxShadow: '0 2px 4px rgba(217,151,6,0.15), 0 8px 16px rgba(217,151,6,0.1)'}}>
                Sí, Quiero Mi CV Ganador (Gratis)
                <ArrowRight className="ml-3 w-6 h-6" />
              </button>
            </Link>
            <button className="font-space-grotesk bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] px-12 py-5 text-xl font-bold hover:bg-[#1A1A1A] hover:text-white transition-all rounded-2xl" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.08), 0 4px 12px rgba(26,26,26,0.05)'}}>
              Ver Transformación Real
            </button>
          </div>

          {/* Prueba social que convence */}
          <div className="bg-white border-2 border-[#E5E5E5] p-12 max-w-5xl mx-auto hover:border-[#D97706] transition-all rounded-2xl hover:shadow-[0_4px_16px_rgba(217,151,6,0.12),0_12px_32px_rgba(217,151,6,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
            <h3 className="font-pixelify-sans text-2xl font-bold text-[#1A1A1A] mb-8">
              RESULTADOS REALES DE PERSONAS REALES
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="font-pixelify-sans text-4xl md:text-5xl font-bold text-[#D97706] mb-4">12,847</div>
                <div className="font-space-grotesk text-lg font-bold text-[#1A1A1A] mb-2">Profesionales Contratados</div>
                <div className="font-space-grotesk text-base text-[#6B6B6B] font-medium">en los últimos 6 meses</div>
              </div>
              <div className="text-center">
                <div className="font-pixelify-sans text-4xl md:text-5xl font-bold text-[#DC2626] mb-4">340%</div>
                <div className="font-space-grotesk text-lg font-bold text-[#1A1A1A] mb-2">Más Llamadas de RRHH</div>
                <div className="font-space-grotesk text-base text-[#6B6B6B] font-medium">vs. CV anterior promedio</div>
              </div>
              <div className="text-center">
                <div className="font-pixelify-sans text-4xl md:text-5xl font-bold text-[#059669] mb-4">$8,200</div>
                <div className="font-space-grotesk text-lg font-bold text-[#1A1A1A] mb-2">Aumento Salarial Promedio</div>
                <div className="font-space-grotesk text-base text-[#6B6B6B] font-medium">primer año post-optimización</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}