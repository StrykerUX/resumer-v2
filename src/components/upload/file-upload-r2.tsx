'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Upload, CheckCircle, AlertCircle, Loader2, CloudUpload, Brain } from 'lucide-react'

interface FileUploadR2Props {
  onUploadComplete?: (fileUrl: string, resumeId: string) => void
}

export function FileUploadR2({ onUploadComplete }: FileUploadR2Props) {
  const { t } = useTranslations()
  const router = useRouter()
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; resumeId: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Tipo de archivo no soportado. Use PDF, Word o imágenes.')
        return
      }

      // Validar tamaño
      const maxSize = file.type.startsWith('image/') ? 4 * 1024 * 1024 : 16 * 1024 * 1024
      if (file.size > maxSize) {
        setErrorMessage(`Archivo muy grande. Máximo ${file.type.startsWith('image/') ? '4MB' : '16MB'}.`)
        return
      }

      setSelectedFile(file)
      setErrorMessage('')
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      // Simular selección de archivo
      const fakeEvent = {
        target: { files: [file] }
      } as any
      handleFileSelect(fakeEvent)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const uploadToR2 = async (presignedUrl: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Monitorear progreso
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.open('PUT', presignedUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadStatus('uploading')
    setUploadProgress(0)
    setErrorMessage('')

    try {
      // 1. Obtener URL pre-firmada
      const presignedResponse = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      })

      if (!presignedResponse.ok) {
        const error = await presignedResponse.json()
        throw new Error(error.error || 'Error obteniendo URL de upload')
      }

      const { uploadUrl, resumeId, fileUrl } = await presignedResponse.json()

      // 2. Upload directo a R2
      await uploadToR2(uploadUrl, selectedFile)

      // 3. Confirmar upload exitoso
      const confirmResponse = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId,
          success: true,
        }),
      })

      if (!confirmResponse.ok) {
        throw new Error('Error confirmando upload')
      }

      setUploadedFile({
        name: selectedFile.name,
        url: fileUrl,
        resumeId,
      })
      setUploadStatus('success')
      onUploadComplete?.(fileUrl, resumeId)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Error al subir el archivo')
    }
  }

  const goToPreview = () => {
    if (uploadedFile?.resumeId) {
      router.push(`/dashboard/resumes/${uploadedFile.resumeId}`)
    }
  }

  const goToAnalyze = () => {
    if (uploadedFile?.resumeId) {
      router.push(`/dashboard/analyze?resumeId=${uploadedFile.resumeId}`)
    }
  }

  if (uploadStatus === 'success' && uploadedFile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-green-600">
            ¡Archivo subido exitosamente a Cloudflare R2!
          </CardTitle>
          <CardDescription>
            Tu currículum ha sido procesado y está listo para revisar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CloudUpload className="w-6 h-6 text-blue-500" />
            <div className="flex-1">
              <p className="font-medium">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">Almacenado en Cloudflare R2</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button onClick={goToAnalyze} className="w-full bg-green-600 hover:bg-green-700">
              <Brain className="w-4 h-4 mr-2" />
              Analizar con IA (5 créditos)
            </Button>
            
            <div className="flex gap-3">
              <Button onClick={goToPreview} variant="outline" className="flex-1">
                Ver Vista Previa
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadStatus('idle')
                  setUploadedFile(null)
                  setSelectedFile(null)
                  setUploadProgress(0)
                }}
              >
                Subir Otro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CloudUpload className="w-16 h-16 text-blue-500" />
        </div>
        <CardTitle>Sube tu Currículum a Cloudflare R2</CardTitle>
        <CardDescription>
          Upload directo a Cloudflare R2 para máximo rendimiento y seguridad
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploadStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {uploadStatus === 'uploading' ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Subiendo a Cloudflare R2...</p>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-600">{uploadProgress}%</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="mb-4"
              />
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <CloudUpload className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-gray-600">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                </div>
              )}
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile}
              className="w-full"
            >
              <CloudUpload className="w-4 h-4 mr-2" />
              Subir a Cloudflare R2
            </Button>

            <div className="text-center text-sm text-gray-500 space-y-1">
              <p>Formatos soportados: PDF, DOCX, DOC, JPG, PNG</p>
              <p>Tamaño máximo: 16MB para documentos, 4MB para imágenes</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <CloudUpload className="w-4 h-4 text-blue-500" />
                <span className="text-blue-600 font-medium">Powered by Cloudflare R2</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}