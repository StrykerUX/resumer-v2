'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PipelineProgress, AIAgent, AI_STATUS_MESSAGES } from '@/types/ai-pipeline';
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google';
import { 
  Loader2, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Brain, 
  Zap, 
  Target,
  Shield,
  Crown,
  Sparkles
} from 'lucide-react';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
});

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
});

interface AIProgressProps {
  progress: PipelineProgress | null;
  isActive: boolean;
  completedSteps: string[];
  pipelineType: 'analysis' | 'simple' | 'advanced' | 'specialized';
}

export function AIProgress({ progress, isActive, completedSteps, pipelineType }: AIProgressProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotar mensajes para la IA actual
  useEffect(() => {
    if (!progress || !isActive) return;
    
    const messages = AI_STATUS_MESSAGES[progress.currentAgent.id] || ['Procesando...'];
    
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [progress?.currentAgent.id, isActive]);

  useEffect(() => {
    if (progress && isActive) {
      const messages = AI_STATUS_MESSAGES[progress.currentAgent.id] || ['Procesando...'];
      setCurrentMessage(messages[messageIndex]);
    }
  }, [progress, messageIndex, isActive]);

  const getAgentIcon = (agentId: string) => {
    const icons = {
      'analyst': <Brain className="w-5 h-5" />,
      'content-enhancer': <Cpu className="w-5 h-5" />,
      'industry-recruiter': <Shield className="w-5 h-5" />,
      'position-enhancer': <Target className="w-5 h-5" />,
      'expert-recruiter': <Crown className="w-5 h-5" />,
      'head-hunter': <Sparkles className="w-5 h-5" />,
      'humanizer': <Zap className="w-5 h-5" />
    };
    
    return icons[agentId as keyof typeof icons] || <Cpu className="w-5 h-5" />;
  };

  const getAgentColor = (agentId: string) => {
    const colors = {
      'analyst': 'bg-blue-500',
      'content-enhancer': 'bg-orange-500',
      'industry-recruiter': 'bg-green-500',
      'position-enhancer': 'bg-purple-500',
      'expert-recruiter': 'bg-red-500',
      'head-hunter': 'bg-yellow-500',
      'humanizer': 'bg-pink-500'
    };
    
    return colors[agentId as keyof typeof colors] || 'bg-gray-500';
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPipelineTitle = (type: string): string => {
    const titles = {
      analysis: 'ANÁLISIS INTELIGENTE',
      simple: 'MEJORA SIMPLE',
      advanced: 'MEJORA AVANZADA',
      specialized: 'MEJORA ESPECIALIZADA'
    };
    
    return titles[type as keyof typeof titles] || 'PROCESANDO';
  };

  const getPipelineDescription = (type: string): string => {
    const descriptions = {
      analysis: 'Análisis completo por IA experta',
      simple: '2 IAs trabajando en tu CV',
      advanced: '5 IAs especializadas optimizando',
      specialized: '6 IAs + alineación específica'
    };
    
    return descriptions[type as keyof typeof descriptions] || 'Procesando con IAs especializadas';
  };

  if (!isActive && completedSteps.length === 0) {
    return null;
  }

  return (
    <div className={`${pixelifySans.variable} ${spaceGrotesk.variable} w-full max-w-2xl mx-auto`}>
      {/* Header del Pipeline */}
      <Card className="mb-6 bg-white border-2 border-[#D97706] shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-[#D97706] rounded-xl flex items-center justify-center mr-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-pixelify-sans text-xl text-[#1A1A1A]">
                {getPipelineTitle(pipelineType)}
              </CardTitle>
              <CardDescription className="font-space-grotesk text-sm text-[#6B6B6B]">
                {getPipelineDescription(pipelineType)}
              </CardDescription>
            </div>
          </div>
          
          {progress && isActive && (
            <div className="bg-[#F7F7F5] rounded-xl p-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-space-grotesk text-sm font-medium text-[#1A1A1A]">
                  Progreso General
                </span>
                <Badge variant="outline" className="font-pixelify-sans text-xs">
                  {progress.currentStep}/{progress.totalSteps}
                </Badge>
              </div>
              
              <div className="w-full bg-[#E5E5E5] rounded-full h-3 mb-2">
                <div 
                  className="bg-[#D97706] h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
                <span className="font-space-grotesk">
                  {Math.round(progress.progressPercentage)}% completado
                </span>
                <span className="font-space-grotesk flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(Math.floor(progress.estimatedTimeRemaining / 1000))} restante
                </span>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* IA Actual Trabajando */}
      {progress && isActive && (
        <Card className="mb-6 bg-white border-2 border-[#D97706] shadow-lg animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 ${getAgentColor(progress.currentAgent.id)} rounded-xl flex items-center justify-center mr-4`}>
                {getAgentIcon(progress.currentAgent.id)}
              </div>
              <div className="flex-1">
                <h3 className="font-pixelify-sans text-lg font-bold text-[#1A1A1A] mb-1">
                  {progress.currentAgent.name}
                </h3>
                <p className="font-space-grotesk text-sm text-[#6B6B6B]">
                  {progress.currentAgent.description}
                </p>
              </div>
              <div className="flex items-center">
                <Loader2 className="w-6 h-6 text-[#D97706] animate-spin mr-2" />
                <Badge className="bg-[#D97706] text-white font-pixelify-sans">
                  TRABAJANDO
                </Badge>
              </div>
            </div>
            
            <div className="bg-[#F7F7F5] rounded-xl p-4">
              <p className="font-space-grotesk text-sm text-[#1A1A1A] mb-2">
                {currentMessage}
              </p>
              <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
                <span className="font-space-grotesk">
                  {progress.currentAgent.function}
                </span>
                <span className="font-space-grotesk">
                  ~{progress.currentAgent.estimatedTime}s estimado
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de IAs Completadas */}
      {completedSteps.length > 0 && (
        <Card className="bg-white border-2 border-[#E5E5E5] shadow-lg">
          <CardHeader>
            <CardTitle className="font-pixelify-sans text-lg text-[#1A1A1A] flex items-center">
              <CheckCircle className="w-5 h-5 text-[#059669] mr-2" />
              IAs COMPLETADAS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedSteps.map((stepId, index) => {
              // Mapear IDs a nombres legibles
              const stepNames = {
                'analyst': 'Analista Experto',
                'content-enhancer': 'Content Enhancer',
                'industry-recruiter': 'Industry Recruiter',
                'position-enhancer': 'Position Enhancer',
                'expert-recruiter': 'Expert Senior Recruiter',
                'head-hunter': 'Head Hunter Enhancer',
                'humanizer': 'Humanizer & Format Expert'
              };
              
              const stepName = stepNames[stepId as keyof typeof stepNames] || stepId;
              
              return (
                <div key={stepId} className="flex items-center justify-between p-3 bg-[#F7F7F5] rounded-xl">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 ${getAgentColor(stepId)} rounded-lg flex items-center justify-center mr-3`}>
                      {getAgentIcon(stepId)}
                    </div>
                    <span className="font-space-grotesk text-sm font-medium text-[#1A1A1A]">
                      {stepName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-[#059669] mr-2" />
                    <Badge variant="outline" className="font-pixelify-sans text-xs text-[#059669]">
                      COMPLETADO
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Mensaje Final */}
      {!isActive && completedSteps.length > 0 && (
        <Card className="mt-6 bg-[#059669] border-2 border-[#059669] text-white shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#059669]" />
            </div>
            <h3 className="font-pixelify-sans text-xl font-bold mb-2">
              ¡PROCESO COMPLETADO!
            </h3>
            <p className="font-space-grotesk text-sm opacity-90">
              Todas las IAs han terminado su trabajo. Tu CV está listo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}