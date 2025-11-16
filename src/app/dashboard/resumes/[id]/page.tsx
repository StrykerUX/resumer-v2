'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Download, 
  Eye, 
  ArrowLeft, 
  Calendar, 
  FileIcon, 
  AlertCircle,
  Loader2,
  Sparkles,
  Target
} from 'lucide-react'
import Link from 'next/link'

interface Resume {
  id: string
  originalName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function ResumePreviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && id) {
      fetchResume()
    }
  }, [status, id, router])

  const fetchResume = async () => {
    try {
      const response = await fetch(`/api/resumes/${id}`)
      if (!response.ok) {
        throw new Error('Resume not found')
      }
      const data = await response.json()
      setResume(data)
    } catch (error) {
      console.error('Error fetching resume:', error)
      setError('No se pudo cargar el currículum')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />
    if (mimeType.includes('word')) return <FileIcon className="w-6 h-6 text-blue-500" />
    if (mimeType.includes('image')) return <Eye className="w-6 h-6 text-green-500" />
    return <FileIcon className="w-6 h-6 text-gray-500" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Badge variant="secondary">Subido</Badge>
      case 'analyzing':
        return <Badge variant="outline">Analizando</Badge>
      case 'completed':
        return <Badge variant="default">Completado</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Currículum no encontrado</h1>
            <p className="text-gray-600 mb-4">El currículum que buscas no existe o no tienes permisos para verlo.</p>
            <Button onClick={() => router.push('/dashboard')}>
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Vista Previa del Currículum
              </h1>
              <p className="text-gray-600">
                Revisa tu currículum y comienza el proceso de mejora
              </p>
            </div>
            {getStatusBadge(resume.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getFileTypeIcon(resume.mimeType)}
                  <span className="ml-3">Vista Previa</span>
                </CardTitle>
                <CardDescription>
                  Tu archivo original tal como lo subiste
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 text-center min-h-96 flex items-center justify-center">
                  {resume.mimeType.includes('image') ? (
                    <img 
                      src={resume.fileUrl} 
                      alt={resume.originalName}
                      className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                    />
                  ) : resume.mimeType.includes('pdf') ? (
                    <div className="space-y-4">
                      <FileText className="w-16 h-16 text-red-500 mx-auto" />
                      <div>
                        <p className="font-medium text-gray-900">Archivo PDF</p>
                        <p className="text-sm text-gray-600">Haz clic en "Ver Archivo" para abrir</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FileIcon className="w-16 h-16 text-blue-500 mx-auto" />
                      <div>
                        <p className="font-medium text-gray-900">Documento Word</p>
                        <p className="text-sm text-gray-600">Haz clic en "Descargar" para abrir</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button asChild className="flex-1">
                    <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Archivo
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={resume.fileUrl} download={resume.originalName}>
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Info & Actions */}
          <div className="space-y-6">
            {/* File Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Archivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nombre</p>
                  <p className="text-sm text-gray-900">{resume.originalName}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Tamaño</p>
                  <p className="text-sm text-gray-900">{formatFileSize(resume.fileSize)}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo</p>
                  <p className="text-sm text-gray-900">
                    {resume.mimeType.includes('pdf') ? 'PDF' : 
                     resume.mimeType.includes('word') ? 'Word' : 
                     resume.mimeType.includes('image') ? 'Imagen' : 'Documento'}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Subido</p>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(resume.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enhancement Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Mejoras Disponibles</CardTitle>
                <CardDescription>
                  Selecciona el tipo de mejora que deseas aplicar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/enhance?resumeId=${resume.id}&type=general`)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Mejora General (10 créditos)
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/enhance?resumeId=${resume.id}&type=targeted`)}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Mejora Específica (15 créditos)
                </Button>
                <p className="text-xs text-gray-500">
                  Primero analiza tu CV, luego podrás mejorarlo
                </p>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis ATS</CardTitle>
                <CardDescription>
                  Puntuación de compatibilidad con sistemas ATS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-gray-400 mb-2">--</div>
                  <p className="text-sm text-gray-500">
                    Análisis disponible después de la mejora
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}