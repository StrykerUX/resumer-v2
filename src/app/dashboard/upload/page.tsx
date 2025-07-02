'use client'

import { FileUploadR2 } from '@/components/upload/file-upload-r2'
import { useTranslations } from '@/hooks/use-translations'
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import Link from 'next/link'
import { ArrowLeft, Upload, Cpu } from 'lucide-react'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export default function UploadPage() {
  const { t } = useTranslations()

  return (
    <div className={`${pixelifySans.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F7F7F5] text-[#1A1A1A] relative overflow-hidden py-8`}>
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
        <div className="mb-12">
          <Link 
            href="/dashboard" 
            className="font-space-grotesk inline-flex items-center text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-8 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Link>
          
          <div className="text-center">
            {/* Indicador sutil de tecnología */}
            <p className="text-sm text-[#6B6B6B] font-medium mb-6 flex items-center justify-center">
              <Cpu className="w-3 h-3 mr-2 text-[#D97706]" />
              Procesamiento Inteligente de Archivos
            </p>
            
            <h1 className="font-pixelify-sans text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
              SUBIR CURRÍCULUM
            </h1>
            <p className="font-space-grotesk text-lg md:text-xl text-[#6B6B6B] font-medium max-w-3xl mx-auto">
              Sube tu currículum para comenzar el proceso de mejora con inteligencia artificial
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#D97706] transition-all rounded-2xl hover:shadow-[0_4px_16px_rgba(217,151,6,0.12),0_12px_32px_rgba(217,151,6,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#D97706] mb-6 flex items-center justify-center mx-auto rounded-xl">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-pixelify-sans text-2xl font-bold text-[#1A1A1A] mb-4">
              ZONA DE UPLOAD SEGURA
            </h2>
            <p className="font-space-grotesk text-[#6B6B6B] font-medium max-w-2xl mx-auto">
              Arrastra y suelta tu archivo o haz clic para seleccionar. Procesamiento instantáneo con tecnología de vanguardia.
            </p>
          </div>

          <FileUploadR2 />
        </div>
      </div>
    </div>
  )
}