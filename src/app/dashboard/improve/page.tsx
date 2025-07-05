'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIProgress } from '@/components/ai-progress';
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google';
import { 
  CheckCircle, 
  Download, 
  AlertCircle, 
  ArrowLeft, 
  Cpu, 
  Brain, 
  Target,
  Clock,
  Star,
  Zap
} from 'lucide-react';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
});

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
});

interface Enhancement {
  id: string;
  enhancementType: 'simple' | 'advanced' | 'specialized';
  status: 'processing' | 'completed' | 'error';
  enhancedContent: any;
  creditsUsed: number;
  createdAt: string;
  pipelineInfo?: any;
  scoreImprovement?: any;
}

type PipelineType = 'simple' | 'advanced' | 'specialized';

const PIPELINE_OPTIONS = {
  simple: {
    name: 'MEJORA SIMPLE',
    cost: 15,
    color: 'bg-[#D97706]',
    borderColor: 'border-[#D97706]',
    textColor: 'text-[#D97706]',
    hoverColor: 'hover:bg-[#B45309]',
    icon: Cpu,
    description: '2 IAs trabajando en tu CV',
    features: [
      'Content Enhancer profesional',
      'Humanizer & Format Expert',
      'Score garantizado: 75-85/100',
      'Tiempo: ~5-8 minutos',
      'Mejora de contenido y formato'
    ],
    guarantee: 'Score mínimo 75/100 o devolución automática'
  },
  advanced: {
    name: 'MEJORA AVANZADA',
    cost: 20,
    color: 'bg-[#7C3AED]',
    borderColor: 'border-[#7C3AED]',
    textColor: 'text-[#7C3AED]',
    hoverColor: 'hover:bg-[#6D28D9]',
    icon: Brain,
    description: '5 IAs especializadas con validación',
    features: [
      'Content Enhancer + Industry Recruiter',
      'Expert Senior Recruiter (validación)',
      'Head Hunter Enhancer (nivel ejecutivo)',
      'Humanizer & Format Expert',
      'Score garantizado: 90-95/100',
      'Tiempo: ~8-12 minutos'
    ],
    guarantee: 'Score mínimo 85/100 o reintento automático'
  },
  specialized: {
    name: 'MEJORA ESPECIALIZADA',
    cost: 25,
    color: 'bg-[#DC2626]',
    borderColor: 'border-[#DC2626]',
    textColor: 'text-[#DC2626]',
    hoverColor: 'hover:bg-[#B91C1C]',
    icon: Target,
    description: '6 IAs + alineación específica',
    features: [
      'Position Enhancer (alineación al puesto)',
      'Industry Recruiter + Expert Recruiter',
      'Head Hunter Enhancer premium',
      'Humanizer & Format Expert',
      'Score garantizado: 93-98/100',
      'Tiempo: ~10-15 minutos'
    ],
    guarantee: 'Score mínimo 90/100 o reintento automático'
  }
};

function ImprovePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  const preSelectedType = searchParams.get('type') as PipelineType;

  const [step, setStep] = useState<'selection' | 'form' | 'processing' | 'completed'>('selection');
  const [selectedType, setSelectedType] = useState<PipelineType | null>(preSelectedType);
  const [enhancement, setEnhancement] = useState<Enhancement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [progress, setProgress] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Form data for specialized improvement
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [keyRequirements, setKeyRequirements] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState('');

  useEffect(() => {
    if (!resumeId) {
      router.push('/dashboard');
      return;
    }
    
    fetchUserCredits();
    
    if (preSelectedType) {
      setStep('form');
    }
  }, [resumeId, preSelectedType]);

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

  const addRequirement = () => {
    if (requirementInput.trim() && !keyRequirements.includes(requirementInput.trim())) {
      setKeyRequirements([...keyRequirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setKeyRequirements(keyRequirements.filter(req => req !== requirement));
  };

  const handleTypeSelection = (type: PipelineType) => {
    setSelectedType(type);
    setStep('form');
  };

  const handleStartImprovement = async () => {
    if (!selectedType) return;
    
    const option = PIPELINE_OPTIONS[selectedType];
    
    if (userCredits < option.cost) {
      setError(`Créditos insuficientes. Necesitas ${option.cost} créditos, tienes ${userCredits}.`);
      return;
    }

    setIsLoading(true);
    setStep('processing');
    setError(null);
    setProgress(null);
    setCompletedSteps([]);

    try {
      let endpoint = '';
      switch (selectedType) {
        case 'simple':
          endpoint = '/api/enhance/general';
          break;
        case 'advanced':
          endpoint = '/api/enhance/advanced';
          break;
        case 'specialized':
          endpoint = '/api/enhance/targeted';
          break;
      }
      
      const requestBody: any = {
        resumeId: resumeId
      };

      if (selectedType === 'specialized') {
        if (!jobDescription.trim() && !jobTitle.trim()) {
          throw new Error('Debe proporcionar al menos una descripción del trabajo o título del puesto.');
        }
        
        requestBody.jobTitle = jobTitle;
        requestBody.companyName = companyName;
        requestBody.jobDescription = jobDescription;
        requestBody.keyRequirements = keyRequirements;
      }

      console.log(`🔧 Iniciando mejora ${selectedType}:`, requestBody);

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
        enhancementType: selectedType,
        status: 'completed',
        enhancedContent: data.enhancedContent,
        creditsUsed: data.creditsUsed,
        createdAt: new Date().toISOString(),
        pipelineInfo: data.pipelineInfo,
        scoreImprovement: data.scoreImprovement
      });

      setUserCredits(data.remainingCredits);
      
      // Simular progreso completado
      const aisUsed = data.pipelineInfo?.aisUsed || [];
      setCompletedSteps(aisUsed.map((ai: string, index: number) => `step-${index}`));
      
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
    a.download = `cv_mejorado_${selectedType}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!resumeId) {
    return null;
  }

  return (
    <div className={`${pixelifySans.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F7F7F5] text-[#1A1A1A]`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 font-space-grotesk"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="font-pixelify-sans text-3xl font-bold mb-2">
            MEJORA TU CV CON IA
          </h1>
          <p className="font-space-grotesk text-[#6B6B6B]">
            Elige el nivel de mejora que necesitas para tu currículum
          </p>
        </div>

        {/* Credits info */}
        <Card className="mb-6 border-2 border-[#E5E5E5]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-space-grotesk font-medium">Créditos disponibles</p>
                <p className="font-space-grotesk text-sm text-[#6B6B6B]">Balance actual en tu cuenta</p>
              </div>
              <div className="text-right">
                <div className="font-pixelify-sans text-2xl font-bold text-[#D97706]">
                  {userCredits}
                </div>
                <p className="font-space-grotesk text-sm text-[#6B6B6B]">
                  créditos disponibles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-6 border-2 border-red-200" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-space-grotesk">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main content based on step */}
        {step === 'selection' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(PIPELINE_OPTIONS).map(([type, option]) => {
              const IconComponent = option.icon;
              return (
                <Card 
                  key={type}
                  className={`border-2 ${option.borderColor} hover:shadow-lg transition-all cursor-pointer`}
                  onClick={() => handleTypeSelection(type as PipelineType)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 ${option.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className={`font-pixelify-sans text-xl ${option.textColor} mb-2`}>
                      {option.name}
                    </CardTitle>
                    <div className={`font-pixelify-sans text-3xl font-bold ${option.textColor} mb-2`}>
                      {option.cost} créditos
                    </div>
                    <CardDescription className="font-space-grotesk">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {option.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm font-space-grotesk text-[#6B6B6B]">
                          <div className="w-2 h-2 bg-[#059669] rounded-full mr-3"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-[#F7F7F5] rounded-xl p-3 mb-4">
                      <p className="text-xs font-space-grotesk text-[#6B6B6B]">
                        <strong>Garantía:</strong> {option.guarantee}
                      </p>
                    </div>

                    <Button 
                      className={`font-space-grotesk w-full ${option.color} text-white py-3 font-bold ${option.hoverColor} transition-all rounded-xl`}
                      disabled={userCredits < option.cost}
                    >
                      {userCredits < option.cost 
                        ? `Necesitas ${option.cost - userCredits} créditos más`
                        : `Elegir ${option.name.split(' ')[1]}`
                      }
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {step === 'form' && selectedType && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="font-pixelify-sans text-xl flex items-center">
                  {React.createElement(PIPELINE_OPTIONS[selectedType].icon, { 
                    className: `w-6 h-6 mr-3 ${PIPELINE_OPTIONS[selectedType].textColor}` 
                  })}
                  {PIPELINE_OPTIONS[selectedType].name}
                </CardTitle>
                <CardDescription className="font-space-grotesk">
                  {selectedType === 'specialized' 
                    ? 'Proporciona información sobre el puesto objetivo para máxima personalización'
                    : PIPELINE_OPTIONS[selectedType].description
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedType === 'specialized' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="jobTitle" className="font-space-grotesk">Título del puesto</Label>
                      <Input
                        id="jobTitle"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="ej. Desarrollador Full Stack Senior"
                        className="font-space-grotesk"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyName" className="font-space-grotesk">Empresa (opcional)</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="ej. Google, Microsoft, etc."
                        className="font-space-grotesk"
                      />
                    </div>

                    <div>
                      <Label htmlFor="jobDescription" className="font-space-grotesk">Descripción del trabajo *</Label>
                      <Textarea
                        id="jobDescription"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Pega aquí la descripción completa del trabajo o los requisitos principales..."
                        className="min-h-[120px] font-space-grotesk"
                      />
                      <p className="font-space-grotesk text-sm text-[#6B6B6B] mt-1">
                        Incluye responsabilidades, requisitos técnicos, y cualquier información relevante del puesto.
                      </p>
                    </div>

                    <div>
                      <Label className="font-space-grotesk">Requisitos clave (opcional)</Label>
                      <div className="flex space-x-2 mb-2">
                        <Input
                          value={requirementInput}
                          onChange={(e) => setRequirementInput(e.target.value)}
                          placeholder="ej. React, Python, 3+ años experiencia"
                          onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                          className="font-space-grotesk"
                        />
                        <Button type="button" onClick={addRequirement} variant="outline" className="font-space-grotesk">
                          Agregar
                        </Button>
                      </div>
                      {keyRequirements.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {keyRequirements.map((req, index) => (
                            <Badge key={index} variant="secondary" className="cursor-pointer font-space-grotesk" onClick={() => removeRequirement(req)}>
                              {req} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />
                  </div>
                )}

                <div className="bg-[#F7F7F5] p-6 rounded-xl">
                  <h4 className="font-pixelify-sans font-bold text-[#1A1A1A] mb-3">¿QUÉ INCLUYE ESTA MEJORA?</h4>
                  <ul className="font-space-grotesk text-sm text-[#6B6B6B] space-y-2">
                    {PIPELINE_OPTIONS[selectedType].features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="w-4 h-4 text-[#D97706] mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#D97706]/10 to-[#D97706]/5 rounded-xl border border-[#D97706]/20">
                  <div>
                    <p className="font-space-grotesk text-sm font-medium text-[#1A1A1A]">Costo total</p>
                    <p className="font-space-grotesk text-xs text-[#6B6B6B]">Se descontará de tu balance</p>
                  </div>
                  <div className="text-right">
                    <div className="font-pixelify-sans text-2xl font-bold text-[#D97706]">
                      {PIPELINE_OPTIONS[selectedType].cost}
                    </div>
                    <p className="font-space-grotesk text-xs text-[#6B6B6B]">créditos</p>
                  </div>
                </div>

                <Button 
                  onClick={handleStartImprovement} 
                  disabled={
                    userCredits < PIPELINE_OPTIONS[selectedType].cost || 
                    isLoading || 
                    (selectedType === 'specialized' && !jobDescription.trim() && !jobTitle.trim())
                  }
                  className={`font-space-grotesk w-full ${PIPELINE_OPTIONS[selectedType].color} text-white py-4 text-lg font-bold ${PIPELINE_OPTIONS[selectedType].hoverColor} transition-all rounded-xl`}
                  size="lg"
                >
                  {userCredits < PIPELINE_OPTIONS[selectedType].cost 
                    ? `Necesitas ${PIPELINE_OPTIONS[selectedType].cost - userCredits} créditos más` 
                    : (selectedType === 'specialized' && !jobDescription.trim() && !jobTitle.trim())
                      ? 'Completa al menos el título o descripción'
                      : `INICIAR MEJORA ${PIPELINE_OPTIONS[selectedType].name.split(' ')[1]} (${PIPELINE_OPTIONS[selectedType].cost} créditos)`
                  }
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'processing' && (
          <div className="max-w-4xl mx-auto">
            <AIProgress 
              progress={progress}
              isActive={isLoading}
              completedSteps={completedSteps}
              pipelineType={selectedType || 'simple'}
            />
          </div>
        )}

        {step === 'completed' && enhancement && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2 border-[#059669]">
              <CardHeader>
                <CardTitle className="font-pixelify-sans flex items-center text-[#059669]">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  ¡MEJORA COMPLETADA!
                </CardTitle>
                <CardDescription className="font-space-grotesk">
                  Tu CV ha sido optimizado exitosamente con nuestro pipeline de IAs especializadas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-[#F7F7F5] rounded-xl">
                    <div className="font-pixelify-sans text-2xl font-bold text-[#D97706]">
                      {enhancement.creditsUsed}
                    </div>
                    <p className="font-space-grotesk text-xs text-[#6B6B6B]">Créditos usados</p>
                  </div>
                  <div className="text-center p-4 bg-[#F7F7F5] rounded-xl">
                    <div className="font-pixelify-sans text-2xl font-bold text-[#059669]">
                      {enhancement.pipelineInfo?.stepsCompleted || 0}
                    </div>
                    <p className="font-space-grotesk text-xs text-[#6B6B6B]">IAs trabajaron</p>
                  </div>
                  <div className="text-center p-4 bg-[#F7F7F5] rounded-xl">
                    <div className="font-pixelify-sans text-2xl font-bold text-[#7C3AED]">
                      {enhancement.pipelineInfo?.finalScore || 0}
                    </div>
                    <p className="font-space-grotesk text-xs text-[#6B6B6B]">Score final</p>
                  </div>
                  <div className="text-center p-4 bg-[#F7F7F5] rounded-xl">
                    <div className="font-pixelify-sans text-2xl font-bold text-[#DC2626]">
                      {Math.round((enhancement.pipelineInfo?.totalTime || 0) / 1000)}s
                    </div>
                    <p className="font-space-grotesk text-xs text-[#6B6B6B]">Tiempo total</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleDownload} 
                    className="font-space-grotesk flex items-center justify-center bg-[#D97706] hover:bg-[#B45309] text-white flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar CV Mejorado
                  </Button>
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="font-space-grotesk flex-1"
                  >
                    Volver al Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="font-pixelify-sans">CV OPTIMIZADO</CardTitle>
                <CardDescription className="font-space-grotesk">
                  Vista previa de tu currículum mejorado por nuestras IAs especializadas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-[#F7F7F5] p-6 rounded-xl max-h-96 overflow-y-auto">
                  <div 
                    className="font-space-grotesk text-sm"
                    dangerouslySetInnerHTML={{ __html: enhancement.enhancedContent }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
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