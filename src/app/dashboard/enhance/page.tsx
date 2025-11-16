'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  Target,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Coins
} from 'lucide-react';
import Link from 'next/link';

interface Resume {
  id: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: string;
  createdAt: string;
}

interface EnhancementResponse {
  success: boolean;
  enhancementId: string;
  enhancedContent: string;
  creditsUsed: number;
  remainingCredits: number;
  enhancementType: string;
}

function EnhancePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const resumeId = searchParams.get('resumeId');
  const typeParam = searchParams.get('type') as 'general' | 'targeted' | null;

  const [step, setStep] = useState<'select' | 'input' | 'processing' | 'result'>('select');
  const [enhancementType, setEnhancementType] = useState<'general' | 'targeted'>(typeParam || 'general');
  const [resume, setResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);

  useEffect(() => {
    if (!resumeId) {
      router.push('/dashboard/upload');
      return;
    }

    fetchResume();
    fetchUserCredits();
  }, [resumeId]);

  useEffect(() => {
    if (typeParam) {
      setEnhancementType(typeParam);
      if (typeParam === 'general') {
        setStep('input');
      } else {
        setStep('input');
      }
    }
  }, [typeParam]);

  const fetchResume = async () => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (!response.ok) {
        throw new Error('Resume not found');
      }
      const data = await response.json();
      setResume(data);
    } catch (error) {
      console.error('Error fetching resume:', error);
      setError('No se pudo cargar la información del CV');
    }
  };

  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/credits');
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.credits || 0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleSelectType = (type: 'general' | 'targeted') => {
    setEnhancementType(type);
    setStep('input');
  };

  const handleStartEnhancement = async () => {
    if (!resume) return;

    const cost = enhancementType === 'general' ? 10 : 15;

    // Validar créditos
    if (userCredits < cost) {
      setError(`Créditos insuficientes. Necesitas ${cost} créditos, tienes ${userCredits}.`);
      return;
    }

    // Validar job description para targeted
    if (enhancementType === 'targeted' && !jobDescription.trim()) {
      setError('Debes proporcionar una descripción del trabajo');
      return;
    }

    setIsLoading(true);
    setStep('processing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resumeId', resume.id);
      formData.append('type', enhancementType);
      if (enhancementType === 'targeted') {
        formData.append('jobDescription', jobDescription);
      }

      console.log('🚀 Iniciando mejora', enhancementType);

      const response = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error(`Créditos insuficientes. Necesitas ${data.required} créditos, tienes ${data.available}.`);
        }
        if (response.status === 400 && data.error === 'Analysis required') {
          throw new Error('Primero debes analizar tu CV. Ve a Analizar CV antes de mejorarlo.');
        }
        throw new Error(data.error || 'Error en la mejora');
      }

      console.log('✅ Mejora completada:', data);

      setEnhancementResult(data);
      setUserCredits(data.remainingCredits);
      setStep('result');

    } catch (error: any) {
      console.error('Error in enhancement:', error);
      setError(error.message || 'Error durante la mejora');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const getCost = (type: 'general' | 'targeted') => {
    return type === 'general' ? 10 : 15;
  };

  if (error && !enhancementResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <div className="flex space-x-2">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
              >
                Volver al Dashboard
              </Button>
              {error.includes('analizar') && (
                <Button onClick={() => router.push(`/dashboard/analyze?resumeId=${resumeId}`)}>
                  Analizar CV
                </Button>
              )}
              {error.includes('Créditos insuficientes') && (
                <Button onClick={() => router.push('/dashboard/credits')}>
                  Comprar Créditos
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Mejorar CV con IA</h1>
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold">{userCredits} créditos</span>
          </div>
        </div>
        <p className="text-gray-600">
          Optimiza tu currículum para destacar en procesos de selección
        </p>
      </div>

      {/* File Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium">{resume.originalName}</p>
              <p className="text-sm text-gray-600">
                {(resume.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <Badge variant="secondary">{resume.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Step: Select Type */}
      {step === 'select' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Selecciona el tipo de mejora</h2>
            <p className="text-gray-600">
              Elige cómo quieres optimizar tu CV
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* General Enhancement */}
            <Card
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => handleSelectType('general')}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                    Mejora General
                  </div>
                  <Badge>{getCost('general')} créditos</Badge>
                </CardTitle>
                <CardDescription>
                  Optimización completa de tu CV para cualquier oportunidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    Mejora de redacción y estructura
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    Optimización para sistemas ATS
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    Formato profesional
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    Énfasis en logros cuantificables
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Targeted Enhancement */}
            <Card
              className="cursor-pointer hover:border-purple-500 transition-colors"
              onClick={() => handleSelectType('targeted')}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Mejora Específica
                  </div>
                  <Badge>{getCost('targeted')} créditos</Badge>
                </CardTitle>
                <CardDescription>
                  Personalización para una oferta de trabajo específica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    Todo lo de Mejora General
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    Alineación con requisitos del trabajo
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    Palabras clave del job posting
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    Énfasis en experiencia relevante
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step: Input */}
      {step === 'input' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {enhancementType === 'general' ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                    Mejora General
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Mejora Específica
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {enhancementType === 'general'
                  ? 'Tu CV será optimizado para cualquier oportunidad laboral'
                  : 'Proporciona la descripción del trabajo para personalizar tu CV'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {enhancementType === 'targeted' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descripción del trabajo <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Pega aquí la descripción completa del trabajo al que estás aplicando. Incluye requisitos, responsabilidades y cualificaciones deseadas..."
                    rows={10}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Mientras más detallada sea la descripción, mejor será la personalización de tu CV
                  </p>
                </div>
              )}

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Importante:</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>✓ Solo mejoraremos la información existente en tu CV</li>
                  <li>✓ No inventaremos experiencias ni habilidades</li>
                  <li>✓ Optimizaremos el formato y la redacción</li>
                  <li>✓ Mantendremos toda tu información veraz</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('select')}
                >
                  Cambiar tipo
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Costo de esta mejora</p>
                    <p className="text-lg font-bold text-gray-900">
                      {getCost(enhancementType)} créditos
                    </p>
                  </div>
                  <Button
                    onClick={handleStartEnhancement}
                    disabled={isLoading || (enhancementType === 'targeted' && !jobDescription.trim())}
                    className="min-w-40"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Iniciar Mejora
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <h3 className="text-2xl font-semibold">Mejorando tu CV...</h3>
              <p className="text-gray-600">
                Nuestra IA está optimizando tu currículum.
                <br />
                Esto puede tomar hasta 60 segundos.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Mientras esperas, prepara una carta de presentación
                  que complemente tu CV mejorado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Result */}
      {step === 'result' && enhancementResult && (
        <div className="space-y-6">
          <Card className="border-green-500">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center text-green-900">
                <CheckCircle className="w-6 h-6 mr-2" />
                ¡Mejora Completada!
              </CardTitle>
              <CardDescription>
                Tu CV ha sido optimizado exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tipo de mejora</p>
                  <p className="text-lg font-bold">
                    {enhancementResult.enhancementType === 'general' ? 'General' : 'Específica'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Créditos usados</p>
                  <p className="text-lg font-bold">{enhancementResult.creditsUsed}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Créditos restantes</p>
                  <p className="text-lg font-bold">{enhancementResult.remainingCredits}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-semibold mb-4">Tu CV Mejorado:</h3>
                <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {enhancementResult.enhancedContent}
                  </pre>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  className="flex-1"
                  onClick={() => router.push(`/dashboard/enhancements/${enhancementResult.enhancementId}`)}
                >
                  Ver Preview Completo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([enhancementResult.enhancedContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cv-mejorado-${Date.now()}.txt`;
                    a.click();
                  }}
                >
                  Descargar TXT
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Volver al Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EnhancePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    }>
      <EnhancePageContent />
    </Suspense>
  );
}
