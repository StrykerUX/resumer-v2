'use client'

import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import { Twitter, Linkedin, Github, Cpu, Mail } from "lucide-react"
import Link from "next/link"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export function Footer() {
  return (
    <footer className={`${pixelifySans.variable} ${spaceGrotesk.variable} bg-[#1A1A1A] text-white py-16 px-4 relative overflow-hidden`}>
      {/* Grid pattern futurista de fondo muy sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(#D97706 1px, transparent 1px),
            linear-gradient(90deg, #D97706 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}></div>
      </div>

      <div className="relative z-10 w-[95%] mx-auto" style={{maxWidth: '1540px'}}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-pixelify-sans text-2xl font-bold mb-6 text-white">
              RESUMER<span className="text-[#D97706]">-V2</span>
            </h3>
            <p className="font-space-grotesk text-[#9CA3AF] mb-6 font-medium leading-relaxed">
              Mejora de currículums impulsada por IA para el profesional moderno.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-[#9CA3AF] hover:text-[#D97706] transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-[#9CA3AF] hover:text-[#D97706] transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-[#9CA3AF] hover:text-[#D97706] transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-[#9CA3AF] hover:text-[#D97706] transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-pixelify-sans text-lg font-bold mb-6 text-white">PRODUCTO</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">Características</Link></li>
              <li><Link href="#pricing" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">Precios</Link></li>
              <li><Link href="#" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">API</Link></li>
              <li><Link href="#" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">Integraciones</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-pixelify-sans text-lg font-bold mb-6 text-white">EMPRESA</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">Acerca de</Link></li>
              <li><Link href="#" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">Blog</Link></li>
              <li><Link href="#" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">Carreras</Link></li>
              <li><Link href="#" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">Contacto</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-pixelify-sans text-lg font-bold mb-6 text-white">SOPORTE</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">Centro de Ayuda</Link></li>
              <li><Link href="#" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">Política de Privacidad</Link></li>
              <li><Link href="#" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">Términos de Servicio</Link></li>
              <li><Link href="#" className="font-space-grotesk text-[#9CA3AF] hover:text-[#D97706] transition-colors font-medium">Estado del Sistema</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t-2 border-[#374151] pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Cpu className="w-4 h-4 text-[#D97706] mr-3" />
              <p className="font-space-grotesk text-[#9CA3AF] font-medium">
                © 2024 Resumer-v2. Todos los derechos reservados.
              </p>
            </div>
            <div className="font-space-grotesk text-sm text-[#9CA3AF] font-medium">
              Construido con IA para el futuro del trabajo
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}