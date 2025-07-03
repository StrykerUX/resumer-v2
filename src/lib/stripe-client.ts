import { loadStripe, Stripe } from '@stripe/stripe-js'

// Variable global para reutilizar la instancia de Stripe
let stripePromise: Promise<Stripe | null>

// Función para obtener la instancia de Stripe (cliente)
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables')
    }
    
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  }
  
  return stripePromise
}

// Función helper para redirigir a Stripe Checkout
export const redirectToCheckout = async (sessionId: string): Promise<void> => {
  const stripe = await getStripe()
  
  if (!stripe) {
    throw new Error('Failed to load Stripe')
  }
  
  const { error } = await stripe.redirectToCheckout({ sessionId })
  
  if (error) {
    throw new Error(error.message)
  }
}

// Función para formatear precios según la moneda
export const formatPrice = (amount: number, currency: 'MXN' | 'USD'): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'MXN' ? 0 : 2,
  }).format(amount)
}

// Configuración de precios para mostrar en UI
export const PRICE_CONFIG = {
  basic: {
    mxn: { amount: 69, display: '$69 MXN' },
    usd: { amount: 3.70, display: '$3.70 USD' },
    credits: 50,
  },
  pro: {
    mxn: { amount: 129, display: '$129 MXN' },
    usd: { amount: 6.90, display: '$6.90 USD' },
    credits: 120,
  },
  premium: {
    mxn: { amount: 199, display: '$199 MXN' },
    usd: { amount: 10.70, display: '$10.70 USD' },
    credits: 200,
  },
}

// Función para obtener el precio formateado
export const getFormattedPrice = (plan: keyof typeof PRICE_CONFIG, currency: 'MXN' | 'USD'): string => {
  const config = PRICE_CONFIG[plan]
  return currency === 'MXN' ? config.mxn.display : config.usd.display
}

// Función para obtener ambos precios (principal y secundario)
export const getDualPricing = (plan: keyof typeof PRICE_CONFIG, primaryCurrency: 'MXN' | 'USD') => {
  const config = PRICE_CONFIG[plan]
  const secondary = primaryCurrency === 'MXN' ? 'USD' : 'MXN'
  
  return {
    primary: getFormattedPrice(plan, primaryCurrency),
    secondary: getFormattedPrice(plan, secondary),
    credits: config.credits,
  }
}