import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, getPriceId, PLAN_CREDITS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🛒 Purchase API called')
    
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ No session found')
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener datos del request
    const { plan, currency } = await request.json()
    
    if (!plan || !currency) {
      console.log('❌ Missing plan or currency:', { plan, currency })
      return NextResponse.json(
        { error: 'Plan y moneda son requeridos' },
        { status: 400 }
      )
    }

    // Validar plan y moneda
    if (!['basic', 'pro', 'premium'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan inválido' },
        { status: 400 }
      )
    }

    if (!['MXN', 'USD'].includes(currency)) {
      return NextResponse.json(
        { error: 'Moneda inválida' },
        { status: 400 }
      )
    }

    console.log('✅ Purchase request:', { 
      email: session.user.email, 
      plan, 
      currency,
      credits: PLAN_CREDITS[plan as keyof typeof PLAN_CREDITS]
    })

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener el price ID de Stripe
    const priceId = getPriceId(plan as keyof typeof PLAN_CREDITS, currency)
    
    if (!priceId) {
      console.log('❌ Price ID not found for:', { plan, currency })
      return NextResponse.json(
        { error: 'Precio no encontrado para este plan y moneda' },
        { status: 400 }
      )
    }

    console.log('💰 Creating Stripe checkout session with:', {
      priceId,
      userEmail: user.email,
      userId: user.id
    })

    // Crear sesión de checkout en Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        userId: user.id,
        plan: plan,
        currency: currency,
        credits: PLAN_CREDITS[plan as keyof typeof PLAN_CREDITS].toString(),
      },
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/purchase/cancelled`,
      automatic_tax: { enabled: false },
      payment_intent_data: {
        setup_future_usage: 'off_session',
      },
    })

    console.log('✅ Stripe checkout session created:', {
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })

  } catch (error) {
    console.error('❌ Purchase API Error:', error)
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown')
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}