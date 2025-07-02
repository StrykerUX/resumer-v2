'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Globe } from "lucide-react"

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' }
]

export function LanguageSelector() {
  const [currentLanguage, setCurrentLanguage] = useState('es')

  useEffect(() => {
    // Get language from localStorage or default to Spanish
    const savedLanguage = localStorage.getItem('language') || 'es'
    setCurrentLanguage(savedLanguage)
  }, [])

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode)
    localStorage.setItem('language', languageCode)
    
    // For now, just reload the page with the new language
    // Later we'll implement proper i18n routing
    window.location.reload()
  }

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0]
  }

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-gray-100 focus:ring-0 focus:ring-offset-0">
        <SelectValue>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">
              {getCurrentLanguage().flag} {getCurrentLanguage().code.toUpperCase()}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center space-x-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}