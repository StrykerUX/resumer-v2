'use client'

import { useState } from 'react'
import { Space_Grotesk, Inter, Work_Sans, Rubik, Outfit, Pixelify_Sans } from 'next/font/google'
import { ArrowRight, Zap, Target, Brain, Sparkles, Download, Upload, Star, Bot, Cpu, Rocket } from 'lucide-react'

// Configuración de tipografías para variaciones semibrutalistas
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const workSans = Work_Sans({ 
  subsets: ['latin'],
  variable: '--font-work-sans'
})

const rubik = Rubik({ 
  subsets: ['latin'],
  variable: '--font-rubik'
})

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit'
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export default function DesignExamplesPage() {
  const [activeExample, setActiveExample] = useState(1)

  const examples = [
    {
      id: 1,
      name: "Semibrutalista Vibrante",
      description: "Space Grotesk + naranja/amarillo + geometría bold",
      theme: "brutalist-vibrant"
    },
    {
      id: 2,
      name: "Claude Retro Grid",
      description: "Outfit + grid retro + elegancia clean",
      theme: "claude-retro"
    },
    {
      id: 3,
      name: "AI Emotional",
      description: "Work Sans + diseño empático + micro-interacciones",
      theme: "ai-emotional"
    },
    {
      id: 4,
      name: "Bold Typography Power",
      description: "Space Grotesk + tipografía experimental + contraste máximo",
      theme: "typography-power"
    },
    {
      id: 5,
      name: "Futurista Elegante",
      description: "Outfit + tecnológico + colores opción 2 + grid naranja",
      theme: "futurista-elegante"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header de navegación */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-sm text-gray-600">
              Design Examples - Resumer v2
            </div>
            <div className="flex space-x-2">
              {examples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => setActiveExample(example.id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    activeExample === example.id
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {example.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ejemplo 1: Semibrutalista Vibrante (Original mejorado) */}
      {activeExample === 1 && (
        <div className={`${spaceGrotesk.variable} font-sans bg-[#0D0D0D] text-white min-h-screen relative overflow-hidden`}>
          {/* Elementos geométricos de fondo */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-[#FF6B35] transform rotate-12"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-[#F7931E] rounded-full"></div>
            <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-[#FFD23F] transform -rotate-45"></div>
            <div className="absolute bottom-20 right-10 w-28 h-28 bg-[#06FFA5] transform rotate-45"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-[#FF6B35] transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-[#FF6B35] text-black text-sm font-bold rounded-none mb-8 transform -rotate-2">
                <Bot className="w-4 h-4 mr-2" />
                RESUMER AI
              </div>

              {/* Título principal */}
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-6">
                CURRÍCULUM
                <span className="block text-[#FF6B35] transform translate-x-8">PERFECTO</span>
              </h1>

              {/* Subtítulo */}
              <p className="text-xl md:text-2xl font-bold max-w-3xl mx-auto mb-12 leading-tight">
                LA IA QUE{' '}
                <span className="bg-[#FFD23F] text-black px-2 py-1 transform inline-block -rotate-1">
                  TRANSFORMA
                </span>{' '}
                TU CARRERA EN 2 MINUTOS
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                <button className="bg-[#06FFA5] text-black px-8 py-4 text-lg font-bold hover:bg-[#05e094] transition-colors transform hover:-rotate-1 flex items-center">
                  CREAR MI CV PERFECTO
                  <Rocket className="w-5 h-5 ml-2" />
                </button>
                <button className="border-2 border-white text-white px-8 py-4 text-lg font-bold hover:bg-white hover:text-black transition-colors transform hover:rotate-1">
                  VER MAGIA IA
                </button>
              </div>

              {/* Stats brutales */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-black text-[#FF6B35]">500%</div>
                  <div className="text-sm font-bold">MÁS OPORTUNIDADES</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-[#F7931E]">120s</div>
                  <div className="text-sm font-bold">TIEMPO TOTAL</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-[#06FFA5]">99.9%</div>
                  <div className="text-sm font-bold">ÉXITO ATS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Ejemplo 2: Claude Retro Grid */}
      {activeExample === 2 && (
        <div className={`${outfit.variable} font-sans bg-[#F7F7F5] text-[#1A1A1A] min-h-screen relative overflow-hidden`}>
          {/* Grid pattern retro */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(#D97706 1px, transparent 1px),
                linear-gradient(90deg, #D97706 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px'
            }}></div>
          </div>

          {/* Elementos geométricos clean */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-3 h-32 bg-[#D97706]"></div>
            <div className="absolute top-32 right-32 w-32 h-3 bg-[#DC2626]"></div>
            <div className="absolute bottom-40 left-1/4 w-2 h-24 bg-[#059669]"></div>
            <div className="absolute bottom-20 right-20 w-24 h-2 bg-[#7C3AED]"></div>
            <div className="absolute top-1/2 left-12 w-4 h-4 bg-[#DC2626]"></div>
            <div className="absolute top-1/3 right-16 w-4 h-4 bg-[#D97706]"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
            <div className="text-center">
              {/* Badge retro clean */}
              <div className="inline-flex items-center px-8 py-4 bg-[#1A1A1A] text-[#F7F7F5] text-sm font-bold mb-12 border-2 border-[#D97706]">
                <Bot className="w-4 h-4 mr-3" />
                CLAUDE INSPIRED AI
              </div>

              {/* Título principal clean & bold */}
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none mb-8">
                <span className="text-[#1A1A1A]">RESUMER</span>
                <span className="block text-[#D97706] mt-2">CLAUDE</span>
              </h1>

              {/* Subtítulo elegante */}
              <div className="max-w-4xl mx-auto mb-16">
                <p className="text-2xl md:text-3xl font-medium text-[#4A4A4A] leading-relaxed mb-4">
                  Inteligencia artificial conversacional
                </p>
                <p className="text-lg md:text-xl text-[#6B6B6B] leading-relaxed">
                  que entiende tu carrera y la{' '}
                  <span className="bg-[#D97706] text-white px-3 py-1 font-bold">
                    optimiza perfectamente
                  </span>
                </p>
              </div>

              {/* CTAs clean retro */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
                <button className="bg-[#1A1A1A] text-[#F7F7F5] px-12 py-4 text-lg font-bold hover:bg-[#2A2A2A] transition-colors border-2 border-[#D97706] flex items-center">
                  Comenzar conversación
                  <ArrowRight className="w-5 h-5 ml-3" />
                </button>
                <button className="border-2 border-[#1A1A1A] text-[#1A1A1A] px-12 py-4 text-lg font-bold hover:bg-[#1A1A1A] hover:text-[#F7F7F5] transition-colors">
                  Ver capacidades
                </button>
              </div>

              {/* Features grid retro */}
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#D97706] transition-colors group">
                  <div className="w-12 h-12 bg-[#059669] mb-6 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Comprensión contextual</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">
                    Entiende el contexto completo de tu experiencia profesional
                  </p>
                </div>
                
                <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#DC2626] transition-colors group">
                  <div className="w-12 h-12 bg-[#DC2626] mb-6 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Optimización precisa</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">
                    Cada palabra cuidadosamente seleccionada para máximo impacto
                  </p>
                </div>
                
                <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#7C3AED] transition-colors group">
                  <div className="w-12 h-12 bg-[#7C3AED] mb-6 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Resultados elegantes</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">
                    CVs pulidos que destacan tu verdadero potencial profesional
                  </p>
                </div>
              </div>

              {/* Stats minimal */}
              <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16">
                <div className="text-center">
                  <div className="text-3xl font-black text-[#D97706] mb-1">99.7%</div>
                  <div className="text-sm font-medium text-[#6B6B6B]">Precisión</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-[#DC2626] mb-1">1.2s</div>
                  <div className="text-sm font-medium text-[#6B6B6B]">Respuesta</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-[#059669] mb-1">∞</div>
                  <div className="text-sm font-medium text-[#6B6B6B]">Adaptabilidad</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ejemplo 3: AI Emotional */}
      {activeExample === 3 && (
        <div className={`${workSans.variable} font-sans bg-gradient-to-br from-[#FEF7ED] to-[#FDF2F8] text-[#1F2937] min-h-screen relative overflow-hidden`}>
          {/* Emotional micro-elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-6 h-6 bg-[#F59E0B] rounded-full opacity-40 animate-pulse"></div>
            <div className="absolute top-32 right-32 w-4 h-4 bg-[#EC4899] rounded-full opacity-60 animate-bounce delay-75"></div>
            <div className="absolute bottom-40 left-1/3 w-8 h-8 bg-[#8B5CF6] rounded-full opacity-30 animate-pulse delay-150"></div>
            <div className="absolute bottom-20 right-20 w-5 h-5 bg-[#06B6D4] rounded-full opacity-50 animate-bounce delay-300"></div>
            <div className="absolute top-1/2 left-16 w-3 h-3 bg-[#10B981] rounded-full opacity-70 animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
            <div className="text-center">
              {/* Empathy badge */}
              <div className="inline-flex items-center px-8 py-4 bg-white shadow-sm border border-[#E5E7EB] rounded-full text-sm font-medium text-[#6B7280] mb-12 hover:shadow-md transition-shadow">
                <Brain className="w-4 h-4 mr-2 text-[#EC4899]" />
                Diseñado con inteligencia emocional
              </div>

              {/* Emotional title */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-[#1F2937] leading-tight mb-6">
                Tu CV merece
                <span className="block font-black text-[#EC4899] italic">
                  comprensión humana
                </span>
              </h1>

              {/* Empathetic subtitle */}
              <div className="max-w-4xl mx-auto mb-16">
                <p className="text-xl md:text-2xl text-[#6B7280] leading-relaxed mb-4">
                  Entendemos que buscar trabajo puede ser estresante.
                </p>
                <p className="text-lg md:text-xl text-[#9CA3AF] leading-relaxed">
                  Por eso creamos una IA que no solo optimiza tu CV, sino que{' '}
                  <span className="bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded-lg font-medium">
                    te acompaña en el proceso
                  </span>
                </p>
              </div>

              {/* Gentle CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
                <button className="bg-[#EC4899] text-white px-12 py-4 text-lg font-medium hover:bg-[#DB2777] transition-all duration-300 rounded-full shadow-sm hover:shadow-lg hover:shadow-pink-200 flex items-center">
                  Comenzar con calma
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button className="border border-[#D1D5DB] text-[#6B7280] px-12 py-4 text-lg font-medium hover:border-[#9CA3AF] hover:text-[#374151] transition-colors rounded-full">
                  Conocer el proceso
                </button>
              </div>

              {/* Emotional features */}
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-white/60 hover:shadow-md transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <Sparkles className="w-8 h-8 text-[#F59E0B]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1F2937] mb-3">Feedback positivo</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    Cada sugerencia está formulada para motivarte y destacar tus fortalezas
                  </p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-white/60 hover:shadow-md transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FCE7F3] to-[#FBCFE8] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <Brain className="w-8 h-8 text-[#EC4899]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1F2937] mb-3">Proceso gradual</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    Avanzamos paso a paso, sin prisas, respetando tu ritmo natural
                  </p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-white/60 hover:shadow-md transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <Target className="w-8 h-8 text-[#06B6D4]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1F2937] mb-3">Confianza renovada</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    Te ayudamos a redescubrir y comunicar tu verdadero valor profesional
                  </p>
                </div>
              </div>

              {/* Gentle stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
                <div className="text-center">
                  <div className="text-3xl font-light text-[#EC4899] mb-1">😊 95%</div>
                  <div className="text-sm text-[#9CA3AF]">Usuarios más confiados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-[#F59E0B] mb-1">💝 4.9</div>
                  <div className="text-sm text-[#9CA3AF]">Satisfacción emocional</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-[#06B6D4] mb-1">🌟 98%</div>
                  <div className="text-sm text-[#9CA3AF]">Recomendarían</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ejemplo 4: Bold Typography Power */}
      {activeExample === 4 && (
        <div className={`${spaceGrotesk.variable} font-sans bg-[#FAFAFA] text-[#000000] min-h-screen relative overflow-hidden`}>
          {/* Typography pattern background */}
          <div className="absolute inset-0 opacity-5">
            <div className="text-9xl font-black text-[#000000] absolute top-10 left-10 transform -rotate-12">A</div>
            <div className="text-7xl font-black text-[#000000] absolute top-20 right-20 transform rotate-45">B</div>
            <div className="text-8xl font-black text-[#000000] absolute bottom-20 left-20 transform rotate-12">C</div>
            <div className="text-6xl font-black text-[#000000] absolute bottom-32 right-32 transform -rotate-6">D</div>
          </div>

          {/* Bold contrast elements */}
          <div className="absolute inset-0">
            <div className="absolute top-16 left-16 w-4 h-64 bg-[#000000]"></div>
            <div className="absolute top-24 right-24 w-64 h-4 bg-[#000000]"></div>
            <div className="absolute bottom-24 left-1/4 w-6 h-48 bg-[#000000]"></div>
            <div className="absolute bottom-16 right-16 w-48 h-6 bg-[#000000]"></div>
          </div>

          <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
            <div className="text-center">
              {/* Typography badge */}
              <div className="inline-flex items-center px-12 py-6 bg-[#000000] text-[#FAFAFA] text-lg font-black mb-16 transform -rotate-2">
                TYPOGRAPHY IS POWER
              </div>

              {/* MASSIVE experimental title */}
              <div className="mb-12">
                <h1 className="text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem] font-black tracking-tighter leading-none">
                  <span className="block text-[#000000]">TYPE</span>
                  <span className="block text-[#000000] transform -translate-x-24">RESUMER</span>
                  <span className="block text-[#000000] transform translate-x-12">POWER</span>
                </h1>
              </div>

              {/* Experimental subtitle layout */}
              <div className="max-w-6xl mx-auto mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="text-left">
                    <p className="text-4xl md:text-5xl font-black leading-tight mb-4">
                      LA TIPOGRAFÍA
                    </p>
                    <p className="text-2xl md:text-3xl font-light text-[#666666]">
                      es el 80% del diseño
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl md:text-5xl font-black leading-tight mb-4">
                      TU CV
                    </p>
                    <p className="text-2xl md:text-3xl font-light text-[#666666]">
                      merece el 100%
                    </p>
                  </div>
                </div>
              </div>

              {/* Bold contrast CTAs */}
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-20">
                <button className="bg-[#000000] text-[#FAFAFA] px-16 py-6 text-2xl font-black hover:bg-[#333333] transition-colors flex items-center">
                  MAXIMUM IMPACT
                  <ArrowRight className="w-8 h-8 ml-4" />
                </button>
                <button className="border-4 border-[#000000] text-[#000000] px-16 py-6 text-2xl font-black hover:bg-[#000000] hover:text-[#FAFAFA] transition-colors">
                  SEE THE POWER
                </button>
              </div>

              {/* Typography showcase grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                <div className="text-center p-8 border-4 border-[#000000] hover:bg-[#000000] hover:text-[#FAFAFA] transition-colors group">
                  <div className="text-6xl font-black mb-4">99%</div>
                  <div className="text-lg font-bold">READABILITY</div>
                </div>
                <div className="text-center p-8 border-4 border-[#000000] hover:bg-[#000000] hover:text-[#FAFAFA] transition-colors group">
                  <div className="text-6xl font-black mb-4">∞</div>
                  <div className="text-lg font-bold">COMBINATIONS</div>
                </div>
                <div className="text-center p-8 border-4 border-[#000000] hover:bg-[#000000] hover:text-[#FAFAFA] transition-colors group">
                  <div className="text-6xl font-black mb-4">1s</div>
                  <div className="text-lg font-bold">FIRST IMPRESSION</div>
                </div>
                <div className="text-center p-8 border-4 border-[#000000] hover:bg-[#000000] hover:text-[#FAFAFA] transition-colors group">
                  <div className="text-6xl font-black mb-4">💥</div>
                  <div className="text-lg font-bold">VISUAL IMPACT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ejemplo 5: Futurista Elegante */}
      {activeExample === 5 && (
        <div className={`${pixelifySans.variable} ${spaceGrotesk.variable} font-sans bg-[#F7F7F5] text-[#1A1A1A] min-h-screen relative overflow-hidden`}>
          {/* Grid pattern futurista (de la opción 2) */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(#D97706 1px, transparent 1px),
                linear-gradient(90deg, #D97706 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px'
            }}></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
            <div className="text-center">
              {/* Indicador sutil */}
              <p className="text-sm text-[#6B6B6B] font-medium mb-16 flex items-center justify-center">
                <Cpu className="w-3 h-3 mr-2 text-[#D97706]" />
                Tecnología de vanguardia
              </p>

              {/* Título futurista elegante - Pixelify Sans para impacto tecnológico */}
              <h1 className="font-pixelify-sans text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-12">
                <span className="text-[#1A1A1A] block">TRANSFORMA TU</span>
                <span className="text-[#1A1A1A] block">CURRÍCULUM CON</span>
                <span className="text-[#D97706] block mt-2">INTELIGENCIA ARTIFICIAL</span>
              </h1>

              {/* Subtítulo tecnológico elegante */}
              <div className="max-w-4xl mx-auto mb-20">
                <p className="font-space-grotesk text-2xl md:text-3xl font-bold text-[#4A4A4A] leading-relaxed mb-6">
                  El futuro de la optimización profesional
                </p>
                <p className="font-space-grotesk text-lg md:text-xl font-medium text-[#6B6B6B] leading-relaxed max-w-3xl mx-auto">
                  Algoritmos avanzados analizan y perfeccionan tu CV con precisión científica. 
                  Resultados medibles, profesionalismo garantizado.
                </p>
              </div>

              {/* CTAs elegantes con colores de la opción 2 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
                <button className="font-space-grotesk bg-[#D97706] text-white px-14 py-5 text-xl font-bold hover:bg-[#B45309] transition-colors shadow-lg flex items-center">
                  Comenzar Transformación
                  <ArrowRight className="w-6 h-6 ml-3" />
                </button>
                <button className="font-space-grotesk bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] px-14 py-5 text-xl font-bold hover:bg-[#1A1A1A] hover:text-white transition-colors shadow-lg">
                  Ver Demostración
                </button>
              </div>

              {/* Características tecnológicas */}
              <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto mb-20">
                <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#D97706] transition-colors">
                  <div className="w-12 h-12 bg-[#D97706] mb-6 flex items-center justify-center mx-auto">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-3">ANÁLISIS INTELIGENTE</h3>
                  <p className="font-space-grotesk text-[#6B6B6B] leading-relaxed font-medium">
                    Procesamiento de lenguaje natural para identificar fortalezas y oportunidades de mejora
                  </p>
                </div>
                
                <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#DC2626] transition-colors">
                  <div className="w-12 h-12 bg-[#DC2626] mb-6 flex items-center justify-center mx-auto">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-3">OPTIMIZACIÓN ATS</h3>
                  <p className="font-space-grotesk text-[#6B6B6B] leading-relaxed font-medium">
                    Compatibilidad garantizada con sistemas de seguimiento de candidatos empresariales
                  </p>
                </div>
                
                <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#059669] transition-colors">
                  <div className="w-12 h-12 bg-[#059669] mb-6 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-3">MEJORA CONTINUA</h3>
                  <p className="font-space-grotesk text-[#6B6B6B] leading-relaxed font-medium">
                    Aprendizaje automático que evoluciona con las tendencias del mercado laboral
                  </p>
                </div>
              </div>

              {/* Métricas tecnológicas */}
              <div className="bg-white border-2 border-[#E5E5E5] p-12 max-w-5xl mx-auto mb-20">
                <h2 className="font-pixelify-sans text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-12 text-center">
                  MÉTRICAS DE RENDIMIENTO
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="text-center">
                    <div className="font-pixelify-sans text-5xl md:text-6xl font-black text-[#D97706] mb-4">97.2%</div>
                    <div className="font-space-grotesk text-lg font-bold text-[#1A1A1A] mb-2">Precisión de Análisis</div>
                    <div className="font-space-grotesk text-base text-[#6B6B6B] font-medium">en identificación de mejoras</div>
                  </div>
                  <div className="text-center">
                    <div className="font-pixelify-sans text-5xl md:text-6xl font-black text-[#1A1A1A] mb-4">89s</div>
                    <div className="font-space-grotesk text-lg font-bold text-[#1A1A1A] mb-2">Tiempo de Procesamiento</div>
                    <div className="font-space-grotesk text-base text-[#6B6B6B] font-medium">promedio de optimización</div>
                  </div>
                  <div className="text-center">
                    <div className="font-pixelify-sans text-5xl md:text-6xl font-black text-[#059669] mb-4">+340%</div>
                    <div className="font-space-grotesk text-lg font-bold text-[#1A1A1A] mb-2">Incremento de Respuestas</div>
                    <div className="font-space-grotesk text-base text-[#6B6B6B] font-medium">en aplicaciones laborales</div>
                  </div>
                </div>
              </div>

              {/* CTA final elegante */}
              <div className="text-center">
                <h2 className="font-pixelify-sans text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-6">
                  EVOLUCIONA TU CARRERA PROFESIONAL
                </h2>
                <p className="font-space-grotesk text-lg text-[#6B6B6B] mb-12 max-w-2xl mx-auto font-medium">
                  Únete a la revolución de la optimización curricular impulsada por inteligencia artificial
                </p>
                <button className="font-space-grotesk bg-[#1A1A1A] text-white px-16 py-6 text-2xl font-bold hover:bg-[#2A2A2A] transition-colors">
                  Acceder a la Plataforma
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer con información del ejemplo activo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-900">
              {examples.find(e => e.id === activeExample)?.name}
            </div>
            <div className="text-sm text-gray-600">
              {examples.find(e => e.id === activeExample)?.description}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Ejemplo {activeExample} de {examples.length}
          </div>
        </div>
      </div>
    </div>
  )
}