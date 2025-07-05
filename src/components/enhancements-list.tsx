'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Download, Calendar, FileText, Sparkles, Target } from 'lucide-react';

interface Enhancement {
  id: string;
  enhancementType: 'general' | 'targeted';
  status: 'processing' | 'completed' | 'error';
  enhancedContent: any;
  creditsUsed: number;
  createdAt: string;
  jobDescription?: string;
  downloadUrl?: string;
}

interface EnhancementsListProps {
  resumeId?: string;
  showAll?: boolean;
  maxItems?: number;
}

export default function EnhancementsList({ 
  resumeId, 
  showAll = false, 
  maxItems = 5 
}: EnhancementsListProps) {
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnhancements();
  }, [resumeId, showAll]);

  const fetchEnhancements = async () => {
    try {
      setIsLoading(true);
      const url = resumeId 
        ? `/api/enhance?resumeId=${resumeId}` 
        : '/api/enhance';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch enhancements');
      }
      
      const data = await response.json();
      if (data.success) {
        const enhancementsList = resumeId 
          ? data.enhancements 
          : data.enhancements;
        
        setEnhancements(showAll ? enhancementsList : enhancementsList.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Error fetching enhancements:', error);
      setError('Error al cargar las mejoras');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (enhancement: Enhancement) => {
    if (!enhancement.enhancedContent) return;

    try {
      const content = typeof enhancement.enhancedContent === 'string' 
        ? enhancement.enhancedContent 
        : enhancement.enhancedContent.enhancedText || JSON.stringify(enhancement.enhancedContent, null, 2);
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cv_mejorado_${enhancement.enhancementType}_${enhancement.createdAt.split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading enhancement:', error);
    }
  };

  const getTypeIcon = (type: 'general' | 'targeted') => {
    return type === 'general' 
      ? <Sparkles className="h-4 w-4" />
      : <Target className="h-4 w-4" />;
  };

  const getTypeLabel = (type: 'general' | 'targeted') => {
    return type === 'general' ? 'Mejora General' : 'Mejora Específica';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'processing': return 'Procesando';
      case 'error': return 'Error';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin mx-auto h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p>Cargando mejoras...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchEnhancements} variant="outline">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (enhancements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mejoras de CV</CardTitle>
          <CardDescription>
            {resumeId 
              ? 'No hay mejoras para este CV aún'
              : 'No tienes mejoras de CV aún'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No hay mejoras disponibles</p>
            <p className="text-sm">
              {resumeId 
                ? 'Analiza este CV primero para poder generar mejoras'
                : 'Sube y analiza un CV para comenzar a generar mejoras'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {resumeId ? 'Mejoras de este CV' : 'Mejoras Recientes'}
          <Badge variant="secondary">
            {enhancements.length} {enhancements.length === 1 ? 'mejora' : 'mejoras'}
          </Badge>
        </CardTitle>
        <CardDescription>
          {resumeId 
            ? 'Historial de mejoras generadas para este CV'
            : 'Tus últimas mejoras de CV con IA'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {enhancements.map((enhancement, index) => (
            <div key={enhancement.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(enhancement.enhancementType)}
                  <span className="font-medium">
                    {getTypeLabel(enhancement.enhancementType)}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(enhancement.status)}
                  >
                    {getStatusText(enhancement.status)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {new Date(enhancement.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">
                    Créditos utilizados: {enhancement.creditsUsed}
                  </p>
                  {enhancement.enhancementType === 'targeted' && enhancement.jobDescription && (
                    <p className="text-sm text-gray-500">
                      Optimizada para puesto específico
                    </p>
                  )}
                </div>
                {enhancement.status === 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(enhancement)}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                )}
              </div>

              {enhancement.status === 'completed' && enhancement.enhancedContent && (
                <div className="mt-3 pt-3 border-t">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                      Ver vista previa
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm max-h-32 overflow-y-auto">
                      <div 
                        className="whitespace-normal text-xs"
                        dangerouslySetInnerHTML={{ 
                          __html: typeof enhancement.enhancedContent === 'string' 
                            ? enhancement.enhancedContent.substring(0, 500) + '...'
                            : enhancement.enhancedContent.enhancedText?.substring(0, 500) + '...' || 'Vista previa no disponible'
                        }}
                      />
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>

        {!showAll && enhancements.length >= maxItems && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Mostrando {maxItems} de las mejoras más recientes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}