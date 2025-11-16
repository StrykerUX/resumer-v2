'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Loader2,
  Sparkles,
  Target,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface Enhancement {
  id: string;
  resumeId: string;
  enhancementType: string;
  jobDescription: string | null;
  enhancedContent: any;
  creditsUsed: number;
  status: string;
  createdAt: string;
  resume: {
    originalName: string;
  };
}

export default function EnhancementViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [enhancement, setEnhancement] = useState<Enhancement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && id) {
      fetchEnhancement();
    }
  }, [status, id, router]);

  const fetchEnhancement = async () => {
    try {
      const response = await fetch(`/api/enhancements/${id}`);
      if (!response.ok) {
        throw new Error('Enhancement not found');
      }
      const data = await response.json();
      setEnhancement(data);
    } catch (error) {
      console.error('Error fetching enhancement:', error);
      setError('No se pudo cargar la mejora');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadAsText = () => {
    if (!enhancement) return;

    const content = typeof enhancement.enhancedContent === 'object'
      ? enhancement.enhancedContent.content
      : enhancement.enhancedContent;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-mejorado-${enhancement.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = () => {
    // TODO: Implementar generación de PDF con Puppeteer
    alert('La descarga en PDF estará disponible próximamente');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
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
    );
  }

  if (!enhancement) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mejora no encontrada</h1>
            <p className="text-gray-600 mb-4">La mejora que buscas no existe o no tienes permisos para verla.</p>
            <Button onClick={() => router.push('/dashboard')}>
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const enhancedContent = typeof enhancement.enhancedContent === 'object'
    ? enhancement.enhancedContent.content
    : enhancement.enhancedContent;

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
                CV Mejorado
              </h1>
              <p className="text-gray-600">
                Vista previa de tu currículum optimizado
              </p>
            </div>
            <Badge variant={enhancement.status === 'completed' ? 'default' : 'secondary'}>
              {enhancement.status === 'completed' ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : null}
              {enhancement.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Contenido Mejorado
                </CardTitle>
                <CardDescription>
                  Tu CV optimizado está listo para descargar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                    {enhancedContent}
                  </pre>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button className="flex-1" onClick={downloadAsText}>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar como TXT
                  </Button>
                  <Button variant="outline" onClick={downloadAsPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enhancement Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Mejora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Archivo Original</p>
                  <p className="text-sm text-gray-900">{enhancement.resume.originalName}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo de Mejora</p>
                  <div className="flex items-center mt-1">
                    {enhancement.enhancementType === 'general' ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                        <p className="text-sm text-gray-900">Mejora General</p>
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2 text-purple-600" />
                        <p className="text-sm text-gray-900">Mejora Específica</p>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-gray-600">Créditos Usados</p>
                  <p className="text-sm text-gray-900">{enhancement.creditsUsed} créditos</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha de Creación</p>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(enhancement.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Job Description (if targeted) */}
            {enhancement.enhancementType === 'targeted' && enhancement.jobDescription && (
              <Card>
                <CardHeader>
                  <CardTitle>Descripción del Trabajo</CardTitle>
                  <CardDescription>
                    Oferta para la cual se optimizó el CV
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {enhancement.jobDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Pasos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Descarga tu CV mejorado y úsalo en tus aplicaciones de trabajo.
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/resumes/${enhancement.resumeId}`)}
                >
                  Ver CV Original
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push('/dashboard/upload')}
                >
                  Subir Otro CV
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
