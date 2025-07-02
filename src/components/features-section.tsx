'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import { Brain, CreditCard, FileCheck, Target, Download, Shield, Cpu } from "lucide-react"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "ANÁLISIS LÁSER",
      description: "Nuestra IA lee tu CV como lo haría un CEO: identifica fortalezas ocultas, elimina palabrería y destaca lo que realmente importa. 3 segundos para impresionar.",
      color: "bg-[#D97706]"
    },
    {
      icon: Target,
      title: "PASA CUALQUIER ATS",
      description: "El 98% de las grandes empresas usan robots para filtrar CVs. Los nuestros están diseñados para pasar todos estos filtros automáticamente.",
      color: "bg-[#DC2626]"
    },
    {
      icon: FileCheck,
      title: "ACEPTA TODO",
      description: "¿Tu CV está en Word mal formateado? ¿Es una foto tomada con el móvil? No importa. Procesamos cualquier cosa y la convertimos en oro.",
      color: "bg-[#059669]"
    },
    {
      icon: CreditCard,
      title: "PAGA SOLO RESULTADOS",
      description: "Sin mensualidades trampa. Usas un crédito, obtienes un CV ganador. No te gusta el resultado? Te devolvemos el crédito.",
      color: "bg-[#7C3AED]"
    },
    {
      icon: Download,
      title: "PDF QUE VENDE",
      description: "No es solo bonito, es estratégico. Cada palabra, cada espacio, cada color está diseñado para que un reclutador diga 'quiero conocer a esta persona'.",
      color: "bg-[#EA580C]"
    },
    {
      icon: Shield,
      title: "CONFIDENCIAL 100%",
      description: "Tu información nunca sale de nuestros servidores. Encriptación militar, cero tracking, cero spam. Tu privacidad es sagrada.",
      color: "bg-[#0F766E]"
    }
  ]

  return (
    <section id="features" className={`${pixelifySans.variable} ${spaceGrotesk.variable} py-20 px-4 bg-[#F7F7F5] text-[#1A1A1A] relative overflow-hidden`}>
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

      <div className="relative z-10 w-[95%] mx-auto" style={{maxWidth: '1540px'}}>
        <div className="text-center mb-16">
          <p className="text-sm text-[#6B6B6B] font-medium mb-6 flex items-center justify-center">
            <Cpu className="w-3 h-3 mr-2 text-[#D97706]" />
            Tecnología que Cambia Carreras
          </p>
          <h2 className="font-pixelify-sans text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
            LA DIFERENCIA ENTRE SER IGNORADO Y SER CONTRATADO
          </h2>
          <p className="font-space-grotesk text-xl text-[#6B6B6B] font-medium max-w-3xl mx-auto">
            No es solo otro editor de CV. Es la ventaja competitiva que necesitas para destacar entre 
            <strong className="text-[#D97706]"> cientos de candidatos</strong> y conseguir que los reclutadores 
            te noten en segundos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#D97706] transition-all rounded-2xl hover:shadow-[0_4px_16px_rgba(217,151,6,0.12),0_12px_32px_rgba(217,151,6,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
              <div className="text-center mb-6">
                <div className={`w-12 h-12 ${feature.color} mb-4 flex items-center justify-center mx-auto rounded-xl`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-pixelify-sans text-lg font-bold text-[#1A1A1A] mb-3">
                  {feature.title}
                </h3>
                <p className="font-space-grotesk text-[#6B6B6B] leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}