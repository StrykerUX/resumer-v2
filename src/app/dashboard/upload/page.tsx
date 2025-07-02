'use client'

import { FileUpload } from '@/components/upload/file-upload'
import { useTranslations } from '@/hooks/use-translations'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function UploadPage() {
  const { t } = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Subir Currículum
          </h1>
          <p className="mt-2 text-gray-600">
            Sube tu currículum para comenzar el proceso de mejora con IA
          </p>
        </div>

        <FileUpload />
      </div>
    </div>
  )
}