import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    console.log('🎣 Stripe webhook received')
    
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.log('❌ No Stripe signature found')
      return NextResponse.json(
        { error: 'No Stripe signature found' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('❌ STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.log('❌ Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('✅ Webhook verified, type:', event.type)

    // Manejar eventos específicos
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('💰 Checkout session completed:', {
          sessionId: session.id,
          metadata: session.metadata,
          customer_email: session.customer_email,
          amount_total: session.amount_total
        })

        await handleSuccessfulPayment(session)
        break

      case 'invoice.payment_succeeded':
        console.log('📄 Invoice payment succeeded')
        break

      case 'payment_intent.succeeded':
        console.log('💳 Payment intent succeeded')
        break

      default:
        console.log('📝 Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    const { userId, plan, currency, credits } = session.metadata || {}

    if (!userId || !plan || !currency || !credits) {
      console.log('❌ Missing metadata in session:', session.metadata)
      throw new Error('Missing required metadata')
    }

    console.log('🎯 Processing payment for:', {
      userId,
      plan,
      currency,
      credits: parseInt(credits)
    })

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, credits: true }
    })

    if (!user) {
      console.log('❌ User not found:', userId)
      throw new Error(`User not found: ${userId}`)
    }

    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      currentCredits: user.credits
    })

    const creditsToAdd = parseInt(credits)
    const newCreditsTotal = user.credits + creditsToAdd

    // Actualizar créditos del usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: newCreditsTotal
      }
    })

    // Crear registro de transacción
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId: userId,
        amount: creditsToAdd,
        type: 'purchase',
        description: `Compra de ${creditsToAdd} créditos - Plan ${plan}`,
        stripeSessionId: session.id,
        currency: currency,
        priceId: session.mode === 'payment' ? 
          (session.line_items?.data?.[0]?.price?.id || 'unknown') : 
          'subscription'
      }
    })

    console.log('✅ Payment processed successfully:', {
      userId,
      oldCredits: user.credits,
      newCredits: updatedUser.credits,
      addedCredits: creditsToAdd,
      transactionId: transaction.id
    })

    return {
      success: true,
      userId,
      creditsAdded: creditsToAdd,
      newTotal: updatedUser.credits,
      transactionId: transaction.id
    }

  } catch (error) {
    console.error('❌ Error processing payment:', error)
    throw error
  }
}

// Configurar para que Next.js no parsee el body como JSON
export const config = {
  api: {
    bodyParser: false,
  },
}