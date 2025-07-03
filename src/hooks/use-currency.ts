'use client'

import { useState, useEffect } from 'react'

export type Currency = 'MXN' | 'USD'

interface UseCurrencyReturn {
  currency: Currency
  setCurrency: (currency: Currency) => void
  isLoading: boolean
  formatPrice: (amount: number) => string
  getCurrencySymbol: () => string
}

export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrencyState] = useState<Currency>('MXN')
  const [isLoading, setIsLoading] = useState(true)

  // Detectar moneda automáticamente
  useEffect(() => {
    const detectCurrency = () => {
      try {
        // Solo ejecutar en el cliente
        if (typeof window === 'undefined') {
          setIsLoading(false)
          return
        }

        // 1. Verificar si hay preferencia guardada
        const savedCurrency = localStorage.getItem('preferred-currency') as Currency
        if (savedCurrency && ['MXN', 'USD'].includes(savedCurrency)) {
          setCurrencyState(savedCurrency)
          setIsLoading(false)
          return
        }

        // 2. Detectar por timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const isMexico = timezone.includes('Mexico') || 
                        timezone.includes('Monterrey') || 
                        timezone.includes('Cancun') ||
                        timezone.includes('Tijuana') ||
                        timezone.includes('Hermosillo')

        // 3. Detectar por locale
        const locale = navigator.language || navigator.languages?.[0] || 'en-US'
        const isMexicanLocale = locale.includes('mx') || locale.includes('MX')

        // 4. Detectar por formato de números
        const isNumberFormatMexico = new Intl.NumberFormat().format(1234.5).includes(',')

        // Si cualquier indicador apunta a México, usar MXN
        const detectedCurrency: Currency = (isMexico || isMexicanLocale || isNumberFormatMexico) ? 'MXN' : 'USD'
        
        setCurrencyState(detectedCurrency)
        localStorage.setItem('preferred-currency', detectedCurrency)
        
        console.log('🌍 Currency detection:', {
          timezone,
          locale,
          numberFormat: new Intl.NumberFormat().format(1234.5),
          isMexico,
          isMexicanLocale,
          isNumberFormatMexico,
          detectedCurrency
        })

      } catch (error) {
        console.error('Error detecting currency:', error)
        // Fallback a MXN si hay error
        setCurrencyState('MXN')
        if (typeof window !== 'undefined') {
          localStorage.setItem('preferred-currency', 'MXN')
        }
      } finally {
        setIsLoading(false)
      }
    }

    detectCurrency()
  }, [])

  // Función para cambiar moneda manualmente
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-currency', newCurrency)
    }
  }

  // Formatear precio según la moneda
  const formatPrice = (amount: number): string => {
    if (currency === 'MXN') {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    }
  }

  // Obtener símbolo de moneda
  const getCurrencySymbol = (): string => {
    return currency === 'MXN' ? '$' : '$'
  }

  return {
    currency,
    setCurrency,
    isLoading,
    formatPrice,
    getCurrencySymbol
  }
}