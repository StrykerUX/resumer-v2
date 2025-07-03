// Tipos para el sistema de pagos Stripe

export type Currency = 'MXN' | 'USD'

export type Plan = 'basic' | 'pro' | 'premium'

export interface PriceConfig {
  amount: number
  display: string
}

export interface PlanConfig {
  mxn: PriceConfig
  usd: PriceConfig
  credits: number
}

export interface DualPricing {
  primary: string
  secondary: string
  credits: number
}

export interface PurchaseRequest {
  plan: Plan
  currency: Currency
}

export interface PurchaseResponse {
  sessionId: string
  url: string
}

export interface CreditBalance {
  credits: number
  userId: string
}

export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
}

export interface CheckoutSession {
  id: string
  customer_email?: string
  metadata?: {
    userId: string
    plan: Plan
    credits: string
  }
  amount_total?: number
  currency?: string
  payment_status: string
}

export interface CreditTransactionData {
  userId: string
  amount: number
  type: 'purchase' | 'usage' | 'welcome_bonus'
  description?: string
  stripeSessionId?: string
  currency?: Currency
  priceId?: string
}