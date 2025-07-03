'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useCredits } from '@/hooks/use-credits'
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import { CheckCircle, CreditCard, ArrowRight, Loader2 } from 'lucide-react'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

function PurchaseSuccessContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { credits, refreshCredits } = useCredits()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    const sessionIdParam = searchParams.get('session_id')
    if (sessionIdParam) {
      setSessionId(sessionIdParam)
      console.log('✅ Payment successful! Session ID:', sessionIdParam)
      
      // Refrescar créditos después del pago exitoso
      setTimeout(() => {
        refreshCredits()
        setIsLoading(false)
      }, 2000) // Dar tiempo para que se procese el webhook
    } else {
      setIsLoading(false)
    }
  }, [status, searchParams, router, refreshCredits])

  if (status === 'loading' || isLoading) {
    return (
      <div className={`${pixelifySans.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F7F7F5] flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D97706] mx-auto mb-4" />
          <p className="font-space-grotesk text-[#6B6B6B]">Procesando tu compra...</p>
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
        <div className="bg-white border-2 border-[#E5E5E5] p-12 max-w-2xl w-full text-center rounded-2xl" style={{boxShadow: '0 4px 16px rgba(217,151,6,0.12), 0 16px 48px rgba(217,151,6,0.08)'}}>
          {/* Success Icon */}
          <div className="w-20 h-20 bg-[#059669] mx-auto mb-8 flex items-center justify-center rounded-full">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="font-pixelify-sans text-3xl font-bold text-[#1A1A1A] mb-4">
            ¡COMPRA EXITOSA!
          </h1>
          
          <p className="font-space-grotesk text-lg text-[#6B6B6B] font-medium mb-8">
            Tu pago se ha procesado correctamente. Los créditos se han agregado a tu cuenta.
          </p>

          {/* Credits Info */}
          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] p-6 mb-8 rounded-xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-[#D97706]" />
              <span className="font-space-grotesk text-lg font-bold text-[#1A1A1A]">
                Créditos Actuales
              </span>
            </div>
            <div className="font-pixelify-sans text-4xl font-bold text-[#D97706]">
              {credits}
            </div>
          </div>

          {/* Transaction Info */}
          {sessionId && (
            <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] p-4 mb-8 rounded-xl">
              <p className="font-space-grotesk text-sm text-[#6B6B6B] font-medium">
                ID de transacción:
              </p>
              <p className="font-space-grotesk text-xs text-[#1A1A1A] font-mono break-all">
                {sessionId}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              className="font-space-grotesk w-full bg-[#D97706] text-white py-3 text-lg font-bold hover:bg-[#B45309] transition-all rounded-xl"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Ir al Dashboard
            </Button>
            
            <Button 
              variant="outline"
              className="font-space-grotesk w-full text-[#1A1A1A] border-2 border-[#1A1A1A] py-3 text-lg font-bold hover:bg-[#1A1A1A] hover:text-white transition-all rounded-xl"
              onClick={() => router.push('/dashboard/upload')}
            >
              Subir mi CV
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t-2 border-[#E5E5E5]">
            <p className="font-space-grotesk text-sm text-[#6B6B6B]">
              ¿Tienes problemas? Contáctanos en{' '}
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

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={
      <div className={`${pixelifySans.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F7F7F5] flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D97706] mx-auto mb-4" />
          <p className="font-space-grotesk text-[#6B6B6B]">Cargando resultado de la compra...</p>
        </div>
      </div>
    }>
      <PurchaseSuccessContent />
    </Suspense>
  )
}