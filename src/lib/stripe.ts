import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

// Configuración de Stripe para el servidor
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
})

// Configuración de precios multi-moneda
export const STRIPE_PRICES = {
  // MXN (Pesos Mexicanos)
  basic_mxn: process.env.STRIPE_PRICE_BASIC_MXN!,     // $69 MXN - 100 créditos
  pro_mxn: process.env.STRIPE_PRICE_PRO_MXN!,         // $129 MXN - 220 créditos  
  premium_mxn: process.env.STRIPE_PRICE_PREMIUM_MXN!, // $199 MXN - 320 créditos
  
  // USD (Dólares)
  basic_usd: process.env.STRIPE_PRICE_BASIC_USD!,     // $3.70 USD - 100 créditos
  pro_usd: process.env.STRIPE_PRICE_PRO_USD!,         // $6.90 USD - 220 créditos
  premium_usd: process.env.STRIPE_PRICE_PREMIUM_USD!, // $10.70 USD - 320 créditos
}

// Mapeo de planes a créditos
export const PLAN_CREDITS = {
  basic: 100,
  pro: 220,
  premium: 320,
}

// Mapeo de planes a precios por moneda
export const getPriceId = (plan: keyof typeof PLAN_CREDITS, currency: 'MXN' | 'USD'): string => {
  const key = `${plan}_${currency.toLowerCase()}` as keyof typeof STRIPE_PRICES
  return STRIPE_PRICES[key]
}

// Validar que todos los price IDs estén configurados
export const validateStripeConfig = () => {
  const missingPrices = Object.entries(STRIPE_PRICES).filter(([key, value]) => !value)
  
  if (missingPrices.length > 0) {
    console.warn('Missing Stripe price IDs:', missingPrices.map(([key]) => key))
    return false
  }
  
  return true
}

// Tipos TypeScript para Stripe
export type StripePlan = keyof typeof PLAN_CREDITS
export type StripeCurrency = 'MXN' | 'USD'
export type StripePrice = keyof typeof STRIPE_PRICES