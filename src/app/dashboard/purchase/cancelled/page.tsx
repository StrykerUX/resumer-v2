'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import { XCircle, ArrowLeft, CreditCard, Loader2 } from 'lucide-react'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export default function PurchaseCancelledPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className={`${pixelifySans.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F7F7F5] flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D97706] mx-auto mb-4" />
          <p className="font-space-grotesk text-[#6B6B6B]">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className={`${pixelifySans.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F7F7F5] text-[#1A1A1A]`}>
      {/* Header */}
      <header className="bg-white border-b-2 border-[#E5E5E5]">
        <div className="w-[95%] mx-auto py-4" style={{maxWidth: '1540px'}}>
          <div className="flex items-center space-x-4">
            <h1 className="font-pixelify-sans text-2xl font-bold text-[#1A1A1A]">
              RESUMER<span className="text-[#D97706]">-v2</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[95%] mx-auto py-12 flex items-center justify-center" style={{maxWidth: '1540px'}}>
        <div className="bg-white border-2 border-[#E5E5E5] p-12 max-w-2xl w-full text-center rounded-2xl" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-[#DC2626] mx-auto mb-8 flex items-center justify-center rounded-full">
            <XCircle className="w-12 h-12 text-white" />
          </div>

          {/* Cancel Message */}
          <h1 className="font-pixelify-sans text-3xl font-bold text-[#1A1A1A] mb-4">
            COMPRA CANCELADA
          </h1>
          
          <p className="font-space-grotesk text-lg text-[#6B6B6B] font-medium mb-8">
            No te preocupes, tu compra ha sido cancelada y no se ha realizado ningún cargo a tu método de pago.
          </p>

          {/* Info Box */}
          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] p-6 mb-8 rounded-xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-[#6B6B6B]" />
              <span className="font-space-grotesk text-lg font-bold text-[#1A1A1A]">
                ¿Qué pasó?
              </span>
            </div>
            <ul className="font-space-grotesk text-[#6B6B6B] text-left space-y-2">
              <li>• Cancelaste el proceso de pago</li>
              <li>• No se realizó ningún cargo</li>
              <li>• Tus créditos actuales no han cambiado</li>
              <li>• Puedes intentar de nuevo cuando quieras</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              className="font-space-grotesk w-full bg-[#D97706] text-white py-3 text-lg font-bold hover:bg-[#B45309] transition-all rounded-xl"
              onClick={() => router.push('/dashboard/credits')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Intentar de Nuevo
            </Button>
            
            <Button 
              variant="outline"
              className="font-space-grotesk w-full text-[#1A1A1A] border-2 border-[#1A1A1A] py-3 text-lg font-bold hover:bg-[#1A1A1A] hover:text-white transition-all rounded-xl"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t-2 border-[#E5E5E5]">
            <p className="font-space-grotesk text-sm text-[#6B6B6B]">
              ¿Tuviste algún problema? Contáctanos en{' '}
              <a href="mailto:support@resumer-v2.com" className="text-[#D97706] hover:underline">
                support@resumer-v2.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}