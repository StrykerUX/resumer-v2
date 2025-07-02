'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadDropzone } from '@/lib/uploadthing'
import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface FileUploadProps {
  onUploadComplete?: (fileUrl: string, resumeId: string) => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const { t } = useTranslations()
  const router = useRouter()
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; resumeId: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleUploadComplete = (res: any) => {
    console.log('Upload completed:', res)
    if (res?.[0]) {
      const file = res[0]
      setUploadedFile({
        name: file.name,
        url: file.url,
        resumeId: file.serverData?.resumeId || ''
      })
      setUploadStatus('success')
      onUploadComplete?.(file.url, file.serverData?.resumeId || '')
    }
  }

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error)
    setUploadStatus('error')
    setErrorMessage(error.message || 'Error al subir el archivo')
  }

  const handleUploadBegin = () => {
    setUploadStatus('uploading')
    setErrorMessage('')
  }

  const goToPreview = () => {
    if (uploadedFile?.resumeId) {
      router.push(`/dashboard/resumes/${uploadedFile.resumeId}`)
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
            ¡Archivo subido exitosamente!
          </CardTitle>
          <CardDescription>
            Tu currículum ha sido procesado y está listo para revisar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-6 h-6 text-blue-500" />
            <div className="flex-1">
              <p className="font-medium">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">Subido correctamente</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={goToPreview} className="flex-1">
              Ver Vista Previa
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setUploadStatus('idle')
                setUploadedFile(null)
              }}
            >
              Subir Otro
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Upload className="w-16 h-16 text-blue-500" />
        </div>
        <CardTitle>Sube tu Currículum</CardTitle>
        <CardDescription>
          Sube tu CV en formato PDF, Word o imagen para comenzar la mejora
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
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Subiendo archivo...</p>
          </div>
        ) : (
          <UploadDropzone
            endpoint="resumeUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={handleUploadBegin}
            appearance={{
              container: "border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors",
              uploadIcon: "text-blue-500",
              label: "text-gray-600 font-medium",
              allowedContent: "text-sm text-gray-500",
              button: "bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors"
            }}
            content={{
              label: "Arrastra tu archivo aquí o haz clic para seleccionar",
              allowedContent: "PDF, Word, JPG, PNG (máx. 16MB)",
              button: "Seleccionar archivo"
            }}
          />
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Formatos soportados: PDF, DOCX, DOC, JPG, PNG</p>
          <p>Tamaño máximo: 16MB para documentos, 4MB para imágenes</p>
        </div>
      </CardContent>
    </Card>
  )
}