'use client'

import { useState, useEffect } from 'react'

type TranslationMessages = {
  [key: string]: any
}

export function useTranslations() {
  const [messages, setMessages] = useState<TranslationMessages>({})
  const [locale, setLocale] = useState('es')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true)
      try {
        // Get language from localStorage or default to Spanish
        const savedLanguage = localStorage.getItem('language') || 'es'
        setLocale(savedLanguage)

        // Dynamically import the translation file
        const translationModule = await import(`../../messages/${savedLanguage}.json`)
        setMessages(translationModule.default || translationModule)
      } catch (error) {
        console.error('Error loading translations:', error)
        // Fallback to Spanish if there's an error
        try {
          const fallbackModule = await import(`../../messages/es.json`)
          setMessages(fallbackModule.default || fallbackModule)
          setLocale('es')
        } catch (fallbackError) {
          console.error('Error loading fallback translations:', fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()

    // Listen for language changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language') {
        loadTranslations()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split('.')
    let value = messages

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return defaultValue || key
      }
    }

    return typeof value === 'string' ? value : defaultValue || key
  }

  return { t, locale, isLoading }
}