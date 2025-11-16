'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Questionnaire from '@/components/questionnaire';
import AnalysisResults from '@/components/analysis-results';

interface Resume {
  id: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: string;
  createdAt: string;
}

interface AnalysisResponse {
  success: boolean;
  analysisId: string;
  analysis: string;
  atsScore: number;
  creditsUsed: number;
  remainingCredits: number;
}

function AnalyzePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId');

  const [step, setStep] = useState<'questionnaire' | 'analyzing' | 'results'>('questionnaire');
  const [resume, setResume] = useState<Resume | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeId) {
      router.push('/dashboard/upload');
      return;
    }
    
    fetchResume();
  }, [resumeId]);

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

  const handleQuestionnaireComplete = (answers: Record<string, string>) => {
    setUserAnswers(answers);
    startAnalysis(answers);
  };

  const handleSkipQuestionnaire = () => {
    startAnalysis({});
  };

  const startAnalysis = async (answers: Record<string, string>) => {
    if (!resume) return;

    setIsLoading(true);
    setStep('analyzing');
    setError(null);

    try {
      // Crear FormData solo con los metadatos - el servidor manejará el archivo
      const formData = new FormData();
      formData.append('resumeId', resume.id);
      formData.append('userAnswers', JSON.stringify(answers));

      console.log('🚀 Enviando análisis para resume:', resume.id);

      // Enviar a análisis - el servidor procesará el archivo desde R2 internamente
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error(`Créditos insuficientes. Necesitas ${data.required} créditos, tienes ${data.available}.`);
        }
        throw new Error(data.error || 'Error en el análisis');
      }

      console.log('✅ Análisis completado:', data);

      // Formatear datos para AnalysisResults
      const analysisData = {
        analysis: {
          content: data.analysis,
          processedText: data.processedText || '',
          metadata: {
            fileName: resume.originalName,
            fileType: resume.mimeType,
            fileSize: resume.fileSize,
            wordCount: data.wordCount || 0
          },
          userAnswers: answers,
          timestamp: new Date().toISOString()
        },
        suggestions: {
          keywords: data.keywords || [],
          improvements: data.improvements || [],
          atsOptimization: data.atsOptimization || []
        },
        atsScore: data.atsScore
      };

      setAnalysisResult(analysisData);
      setStep('results');

    } catch (error: any) {
      console.error('Error in analysis:', error);
      setError(error.message || 'Error durante el análisis');
      setStep('questionnaire');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartImprovement = (type: 'general' | 'targeted') => {
    // Navegar a la página de mejoras
    router.push(`/dashboard/enhance?resumeId=${resumeId}&type=${type}`);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <div className="flex space-x-2">
              <Button 
                onClick={() => router.push('/dashboard/upload')}
                variant="outline"
              >
                Volver al Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>
                Intentar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Cargando información del CV...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Análisis de CV con IA</h1>
        <p className="text-gray-600">
          Obtén un análisis detallado y recomendaciones personalizadas para tu currículum
        </p>
      </div>

      {/* Información del archivo */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Archivo a analizar
            <Badge variant="secondary">{resume.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <p className="font-medium">{resume.originalName}</p>
              <p className="text-sm text-gray-600">
                {(resume.fileSize / 1024).toFixed(1)} KB • {resume.mimeType.includes('pdf') ? 'PDF' : 'Word'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Subido el {new Date(resume.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal según el paso */}
      {step === 'questionnaire' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Personaliza tu análisis</h2>
            <p className="text-gray-600">
              Responde algunas preguntas para obtener recomendaciones más precisas. También puedes saltarte este paso.
            </p>
          </div>
          <Questionnaire
            onComplete={handleQuestionnaireComplete}
            onSkip={handleSkipQuestionnaire}
            isLoading={isLoading}
          />
        </div>
      )}

      {step === 'analyzing' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <h3 className="text-xl font-semibold">Analizando tu CV...</h3>
              <p className="text-gray-600">
                Nuestra IA está revisando tu currículum y generando recomendaciones personalizadas.
                Esto puede tomar hasta 30 segundos.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>¿Sabías qué?</strong> Nuestro sistema analiza más de 50 factores diferentes 
                  para darte las mejores recomendaciones de mejora.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'results' && analysisResult && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Resultados del Análisis</h2>
            <p className="text-gray-600">
              Aquí tienes el análisis completo de tu CV con recomendaciones personalizadas.
            </p>
          </div>
          <AnalysisResults
            analysis={analysisResult.analysis}
            suggestions={analysisResult.suggestions}
            atsScore={analysisResult.atsScore}
            onStartImprovement={handleStartImprovement}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Cargando...</p>
        </div>
      </div>
    }>
      <AnalyzePageContent />
    </Suspense>
  );
}