'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface CreditTransaction {
  id: string
  amount: number
  type: string
  description: string | null
  currency: string | null
  createdAt: string
}

interface CreditData {
  credits: number
  userId: string
  email: string
  memberSince: string
  transactions: CreditTransaction[]
}

interface UseCreditsReturn {
  credits: number
  transactions: CreditTransaction[]
  isLoading: boolean
  error: string | null
  refreshCredits: () => Promise<void>
  hasEnoughCredits: (amount: number) => boolean
}

export function useCredits(): UseCreditsReturn {
  const { data: session, status } = useSession()
  const [creditData, setCreditData] = useState<CreditData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = async () => {
    if (status !== 'authenticated' || !session) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/credits', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al obtener créditos')
      }

      const result = await response.json()
      
      if (result.success) {
        setCreditData(result.data)
      } else {
        throw new Error(result.error || 'Error desconocido')
      }

    } catch (err) {
      console.error('Error fetching credits:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar créditos')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshCredits = async () => {
    await fetchCredits()
  }

  const hasEnoughCredits = (amount: number): boolean => {
    return (creditData?.credits || 0) >= amount
  }

  // Fetch inicial y cuando cambia la sesión
  useEffect(() => {
    fetchCredits()
  }, [session, status])

  // Auto-refresh cada 30 segundos si está autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      const interval = setInterval(() => {
        fetchCredits()
      }, 30000) // 30 segundos

      return () => clearInterval(interval)
    }
  }, [status])

  return {
    credits: creditData?.credits || 0,
    transactions: creditData?.transactions || [],
    isLoading,
    error,
    refreshCredits,
    hasEnoughCredits,
  }
}