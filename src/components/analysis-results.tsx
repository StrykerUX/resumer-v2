'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface AnalysisData {
  content: string;
  processedText: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    pageCount?: number;
    wordCount: number;
  };
  userAnswers?: Record<string, string>;
  timestamp: string;
}

interface SuggestionsData {
  keywords: string[];
  improvements: string[];
  atsOptimization: string[];
}

interface AnalysisResultsProps {
  analysis: AnalysisData;
  suggestions: SuggestionsData;
  atsScore: number;
  onStartImprovement: (type: 'simple' | 'advanced' | 'specialized') => void;
  isLoading?: boolean;
  resumeId?: string;
}

export default function AnalysisResults({ 
  analysis, 
  suggestions, 
  atsScore, 
  onStartImprovement, 
  isLoading = false,
  resumeId
}: AnalysisResultsProps) {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Necesita mejoras';
  };

  // Parsear el contenido del análisis para extraer secciones
  const parseAnalysis = (content: string) => {
    const sections = content.split('\n\n');
    return sections.filter(section => section.trim().length > 0);
  };

  const analysisSections = parseAnalysis(analysis.content);

  return (
    <div className="space-y-6">
      {/* Header con información general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Análisis Completado
            <Badge variant="secondary">
              {analysis.metadata.fileName}
            </Badge>
          </CardTitle>
          <CardDescription>
            Análisis realizado el {new Date(analysis.timestamp).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{analysis.metadata.wordCount}</p>
              <p className="text-sm text-gray-600">Palabras</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{analysis.metadata.pageCount || 1}</p>
              <p className="text-sm text-gray-600">Páginas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{suggestions.keywords.length}</p>
              <p className="text-sm text-gray-600">Palabras clave</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <div className={`w-3 h-3 rounded-full ${getScoreColor(atsScore)} mr-2`} />
                <p className="text-2xl font-bold">{atsScore}/100</p>
              </div>
              <p className="text-sm text-gray-600">Score ATS</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score ATS detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Compatibilidad con Sistemas ATS</CardTitle>
          <CardDescription>
            Qué tan bien pasará tu CV por los filtros automáticos de reclutamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${getScoreColor(atsScore)} transition-all duration-500`}
                style={{ width: `${atsScore}%` }}
              />
            </div>
            <Badge variant={atsScore >= 70 ? "default" : "destructive"}>
              {getScoreText(atsScore)}
            </Badge>
          </div>
          
          {suggestions.atsOptimization.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recomendaciones para mejorar compatibilidad ATS:</h4>
              <ul className="space-y-1">
                {suggestions.atsOptimization.map((optimization, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {optimization}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análisis detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado</CardTitle>
          <CardDescription>
            Evaluación completa de tu CV realizada por inteligencia artificial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisSections.map((section, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {section.trim()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Palabras clave encontradas */}
      {suggestions.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Palabras Clave Identificadas</CardTitle>
            <CardDescription>
              Términos relevantes encontrados en tu CV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestions.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mejoras principales */}
      {suggestions.improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Principales Oportunidades de Mejora</CardTitle>
            <CardDescription>
              Recomendaciones extraídas del análisis de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {suggestions.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span className="text-sm leading-relaxed">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Acciones siguientes */}
      <Card>
        <CardHeader>
          <CardTitle>¿Qué sigue?</CardTitle>
          <CardDescription>
            Elige el nivel de mejora que necesitas para tu currículum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 transition-all">
              <h4 className="font-medium mb-2 text-orange-700">Mejora Simple</h4>
              <p className="text-sm text-gray-600 mb-4">
                2 IAs trabajando: Content Enhancer + Humanizer. Score garantizado: 75-85/100.
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-orange-100 text-orange-700">15 créditos</Badge>
                <Button 
                  onClick={() => onStartImprovement('simple')}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Elegir Simple
                </Button>
              </div>
            </div>

            <div className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition-all">
              <h4 className="font-medium mb-2 text-purple-700">Mejora Avanzada</h4>
              <p className="text-sm text-gray-600 mb-4">
                5 IAs especializadas con validación de recruiter. Score garantizado: 90-95/100.
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-700">20 créditos</Badge>
                <Button 
                  onClick={() => onStartImprovement('advanced')}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Elegir Avanzada
                </Button>
              </div>
            </div>

            <div className="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 transition-all">
              <h4 className="font-medium mb-2 text-red-700">Mejora Especializada</h4>
              <p className="text-sm text-gray-600 mb-4">
                6 IAs + alineación específica para el puesto objetivo. Score garantizado: 93-98/100.
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-red-100 text-red-700">25 créditos</Badge>
                <Button 
                  onClick={() => onStartImprovement('specialized')}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Elegir Especializada
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>💡 Garantía de calidad:</strong> Si tu CV no alcanza el score mínimo garantizado, 
              reintentamos automáticamente o te devolvemos los créditos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}