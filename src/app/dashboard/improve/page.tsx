'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Download, AlertCircle, ArrowLeft } from 'lucide-react';

interface Enhancement {
  id: string;
  enhancementType: 'general' | 'targeted';
  status: 'processing' | 'completed' | 'error';
  enhancedContent: any;
  creditsUsed: number;
  createdAt: string;
}

function ImprovePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  const type = searchParams.get('type') as 'general' | 'targeted';

  const [step, setStep] = useState<'form' | 'processing' | 'completed'>('form');
  const [enhancement, setEnhancement] = useState<Enhancement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);

  // Form data for targeted improvement
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [keyRequirements, setKeyRequirements] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState('');

  const cost = type === 'general' ? 10 : 15;

  useEffect(() => {
    if (!resumeId || !type) {
      router.push('/dashboard');
      return;
    }
    
    fetchUserCredits();
    checkExistingEnhancement();
  }, [resumeId, type]);

  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/credits');
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const checkExistingEnhancement = async () => {
    try {
      // Aquí podrías verificar si ya existe una mejora para este tipo y CV
      // Por ahora asumimos que no existe
    } catch (error) {
      console.error('Error checking existing enhancement:', error);
    }
  };

  const addRequirement = () => {
    if (requirementInput.trim() && !keyRequirements.includes(requirementInput.trim())) {
      setKeyRequirements([...keyRequirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setKeyRequirements(keyRequirements.filter(req => req !== requirement));
  };

  const handleStartImprovement = async () => {
    if (userCredits < cost) {
      setError(`Créditos insuficientes. Necesitas ${cost} créditos, tienes ${userCredits}.`);
      return;
    }

    setIsLoading(true);
    setStep('processing');
    setError(null);

    try {
      const endpoint = type === 'general' ? '/api/enhance/general' : '/api/enhance/targeted';
      
      const requestBody: any = {
        resumeId: resumeId
      };

      if (type === 'targeted') {
        if (!jobDescription.trim() && !jobTitle.trim()) {
          throw new Error('Debe proporcionar al menos una descripción del trabajo o título del puesto.');
        }
        
        requestBody.jobTitle = jobTitle;
        requestBody.companyName = companyName;
        requestBody.jobDescription = jobDescription;
        requestBody.keyRequirements = keyRequirements;
      }

      console.log(`🔧 Iniciando mejora ${type}:`, requestBody);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error(`Créditos insuficientes. Necesitas ${data.required} créditos, tienes ${data.available}.`);
        }
        throw new Error(data.error || 'Error en la mejora');
      }

      console.log('✅ Mejora completada:', data);

      setEnhancement({
        id: data.enhancementId,
        enhancementType: type,
        status: 'completed',
        enhancedContent: data.enhancedContent,
        creditsUsed: data.creditsUsed,
        createdAt: new Date().toISOString()
      });

      setUserCredits(data.remainingCredits);
      setStep('completed');

    } catch (error: any) {
      console.error('Error in improvement:', error);
      setError(error.message || 'Error durante la mejora');
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!enhancement?.enhancedContent) return;

    const content = enhancement.enhancedContent;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv_mejorado_${type}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!resumeId || !type) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold mb-2">
          {type === 'general' ? 'Mejora General' : 'Mejora Específica'}
        </h1>
        <p className="text-gray-600">
          {type === 'general' 
            ? 'Aplicamos las recomendaciones del análisis para crear una versión mejorada de tu CV.'
            : 'Optimizamos tu CV para una oferta de trabajo específica que tengas en mente.'
          }
        </p>
      </div>

      {/* Credits info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Costo de esta mejora</p>
              <p className="text-sm text-gray-600">Créditos necesarios para procesar</p>
            </div>
            <div className="text-right">
              <Badge variant={userCredits >= cost ? "default" : "destructive"}>
                {cost} créditos
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                Tienes {userCredits} créditos disponibles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main content based on step */}
      {step === 'form' && (
        <div className="space-y-6">
          {type === 'general' ? (
            <Card>
              <CardHeader>
                <CardTitle>Mejora General</CardTitle>
                <CardDescription>
                  Aplicaremos automáticamente todas las recomendaciones del análisis de tu CV para crear una versión optimizada.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">¿Qué incluye la mejora general?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Optimización de formato y estructura</li>
                      <li>• Mejora de la redacción y presentación</li>
                      <li>• Integración de palabras clave relevantes</li>
                      <li>• Optimización para sistemas ATS</li>
                      <li>• Aplicación de todas las recomendaciones del análisis</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleStartImprovement} 
                    disabled={userCredits < cost || isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {userCredits < cost ? `Necesitas ${cost - userCredits} créditos más` : `Iniciar mejora (${cost} créditos)`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Mejora Específica</CardTitle>
                <CardDescription>
                  Proporciona información sobre la oferta de trabajo para optimizar tu CV específicamente para esa posición.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jobTitle">Título del puesto</Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="ej. Desarrollador Full Stack Senior"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyName">Empresa (opcional)</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="ej. Google, Microsoft, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobDescription">Descripción del trabajo *</Label>
                    <Textarea
                      id="jobDescription"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Pega aquí la descripción completa del trabajo o los requisitos principales..."
                      className="min-h-[120px]"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Incluye responsabilidades, requisitos técnicos, y cualquier información relevante del puesto.
                    </p>
                  </div>

                  <div>
                    <Label>Requisitos clave (opcional)</Label>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        value={requirementInput}
                        onChange={(e) => setRequirementInput(e.target.value)}
                        placeholder="ej. React, Python, 3+ años experiencia"
                        onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                      />
                      <Button type="button" onClick={addRequirement} variant="outline">
                        Agregar
                      </Button>
                    </div>
                    {keyRequirements.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {keyRequirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRequirement(req)}>
                            {req} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">¿Qué incluye la mejora específica?</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Todo lo de la mejora general</li>
                    <li>• Optimización específica para el puesto objetivo</li>
                    <li>• Priorización de experiencia relevante</li>
                    <li>• Integración de palabras clave del trabajo</li>
                    <li>• Adaptación del resumen profesional</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleStartImprovement} 
                  disabled={userCredits < cost || isLoading || (!jobDescription.trim() && !jobTitle.trim())}
                  className="w-full"
                  size="lg"
                >
                  {userCredits < cost 
                    ? `Necesitas ${cost - userCredits} créditos más` 
                    : (!jobDescription.trim() && !jobTitle.trim())
                      ? 'Completa al menos el título o descripción'
                      : `Iniciar mejora específica (${cost} créditos)`
                  }
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {step === 'processing' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <h3 className="text-xl font-semibold">
                {type === 'general' ? 'Mejorando tu CV...' : 'Optimizando para el puesto...'}
              </h3>
              <p className="text-gray-600">
                Nuestra IA está {type === 'general' ? 'aplicando las mejoras' : 'adaptando tu CV para la oferta específica'}.
                Esto puede tomar hasta 45 segundos.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  ✨ <strong>Procesando...</strong> {type === 'general' 
                    ? 'Optimizando formato, redacción y palabras clave según el análisis.'
                    : 'Priorizando experiencia relevante y adaptando para el puesto objetivo.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'completed' && enhancement && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                ¡Mejora completada!
              </CardTitle>
              <CardDescription>
                Tu CV ha sido mejorado exitosamente. Aquí tienes el resultado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Créditos utilizados: {enhancement.creditsUsed}</p>
                  <p className="text-sm text-gray-600">Créditos restantes: {userCredits}</p>
                </div>
                <Button onClick={handleDownload} className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar CV mejorado
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CV Mejorado</CardTitle>
              <CardDescription>
                Vista previa de tu CV optimizado. Puedes descargar el archivo completo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {enhancement.enhancedContent}
                </pre>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="flex-1"
            >
              Volver al Dashboard
            </Button>
            <Button 
              onClick={() => router.push(`/dashboard/analyze?resumeId=${resumeId}`)}
              className="flex-1"
            >
              Hacer otra mejora
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImprovePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Cargando...</p>
        </div>
      </div>
    }>
      <ImprovePageContent />
    </Suspense>
  );
}