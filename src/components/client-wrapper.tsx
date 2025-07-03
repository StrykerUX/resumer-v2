'use client'

import { useState, useEffect, ReactNode } from 'react'

interface ClientWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientWrapper({ children, fallback }: ClientWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return fallback || null
  }

  return <>{children}</>
}