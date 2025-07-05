// Tipos para el sistema de Pipeline de 7 IAs Especializadas

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  role: string;
  function: string;
  estimatedTime: number; // en segundos
}

export interface PipelineStep {
  agent: AIAgent;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  input?: any;
  output?: any;
  score?: number;
  error?: string;
}

export interface PipelineConfig {
  type: 'analysis' | 'simple' | 'advanced' | 'specialized';
  steps: AIAgent[];
  minScore: number;
  maxRetries: number;
  cost: number;
  // Nuevos campos para mejora progresiva
  minImprovementPercentage: number;
  fallbackMinScore: number; // Score mínimo absoluto como respaldo
}

export interface CVAnalysisResult {
  overallScore: number;
  categoryScores: {
    structure: number;
    content: number;
    keywords: number;
    atsCompatibility: number;
    professionalImpact: number;
  };
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  keywords: string[];
  atsOptimization: string[];
  detailedFeedback: string;
}

export interface EnhancementResult {
  enhancedContent: string;
  improvementsSummary: string[];
  scoreImprovement: {
    before: number;
    after: number;
    improvement: number;
  };
  changesExplanation: string;
}

export interface PipelineResult {
  success: boolean;
  type: PipelineConfig['type'];
  steps: PipelineStep[];
  finalScore: number;
  result: CVAnalysisResult | EnhancementResult;
  totalTime: number;
  creditsUsed: number;
  error?: string;
}

export interface CheckpointResult {
  passed: boolean;
  score: number;
  minRequired: number;
  shouldRetry: boolean;
  retryCount: number;
  maxRetries: number;
  // Nuevos campos para mejora progresiva
  originalScore?: number;
  improvementPercentage?: number;
  minRequiredImprovement?: number;
  improvementType: 'absolute' | 'progressive';
}

export interface IndustryContext {
  industry: string;
  commonKeywords: string[];
  requiredSkills: string[];
  preferredFormat: string;
  sectorSpecificTips: string[];
}

export interface JobContext {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  preferredSkills: string[];
  keywordDensity: Record<string, number>;
}

export interface UserProfile {
  industry?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  targetRole?: string;
  careerObjective?: string;
  preferences?: {
    style?: 'traditional' | 'modern' | 'creative';
    emphasis?: 'technical' | 'leadership' | 'results';
  };
}

export interface PipelineProgress {
  currentStep: number;
  totalSteps: number;
  currentAgent: AIAgent;
  progressPercentage: number;
  estimatedTimeRemaining: number;
  statusMessage: string;
}

// Constantes para las 7 IAs especializadas
export const AI_AGENTS: Record<string, AIAgent> = {
  ANALYST: {
    id: 'analyst',
    name: 'Analista Experto',
    description: 'El Auditor - Detective de CVs que hace diagnóstico completo',
    role: 'Diagnóstico completo sin hacer cambios',
    function: 'Score inicial + lista categorizada de problemas',
    estimatedTime: 90
  },
  CONTENT_ENHANCER: {
    id: 'content-enhancer',
    name: 'Content Enhancer',
    description: 'Editor profesional que reescribe y reorganiza contenido',
    role: 'Reescribir y reorganizar contenido',
    function: 'CV mejorado con mejor estructura y redacción',
    estimatedTime: 120
  },
  INDUSTRY_RECRUITER: {
    id: 'industry-recruiter',
    name: 'Industry Recruiter',
    description: 'Reclutador especializado por sector específico',
    role: 'Optimización específica de industria',
    function: 'CV optimizado para sector específico',
    estimatedTime: 100
  },
  POSITION_ENHANCER: {
    id: 'position-enhancer',
    name: 'Position Enhancer',
    description: 'Adaptador para puesto específico',
    role: 'Alinear CV a job posting específico',
    function: 'CV hyper-targeted sin sonar artificial',
    estimatedTime: 110
  },
  EXPERT_RECRUITER: {
    id: 'expert-recruiter',
    name: 'Expert Senior Recruiter',
    description: 'Reclutador exigente con criterios duros',
    role: 'Control de calidad con criterios duros',
    function: 'Feedback detallado + red flags identificadas',
    estimatedTime: 80
  },
  HEAD_HUNTER: {
    id: 'head-hunter',
    name: 'Head Hunter Enhancer',
    description: 'Consultor ejecutivo de CVs nivel premium',
    role: 'Refinamiento a nivel C-suite',
    function: 'CV refinado a nivel premium ejecutivo',
    estimatedTime: 130
  },
  HUMANIZER: {
    id: 'humanizer',
    name: 'Humanizer & Format Expert',
    description: 'Editor final y especialista en formato',
    role: 'Control de calidad + formato perfecto',
    function: 'PDF final listo para enviar',
    estimatedTime: 70
  }
};

// Configuraciones de pipeline por tipo
export const PIPELINE_CONFIGS: Record<string, PipelineConfig> = {
  analysis: {
    type: 'analysis',
    steps: [AI_AGENTS.ANALYST],
    minScore: 0,
    maxRetries: 1,
    cost: 10,
    minImprovementPercentage: 0, // No aplica para análisis
    fallbackMinScore: 0
  },
  simple: {
    type: 'simple',
    steps: [AI_AGENTS.CONTENT_ENHANCER, AI_AGENTS.HUMANIZER],
    minScore: 70, // Mantener para compatibilidad
    maxRetries: 2,
    cost: 20,
    minImprovementPercentage: 5, // 5% mejora mínima
    fallbackMinScore: 60 // Score mínimo absoluto
  },
  advanced: {
    type: 'advanced',
    steps: [
      AI_AGENTS.CONTENT_ENHANCER,
      AI_AGENTS.INDUSTRY_RECRUITER,
      AI_AGENTS.EXPERT_RECRUITER,
      AI_AGENTS.HEAD_HUNTER,
      AI_AGENTS.HUMANIZER
    ],
    minScore: 75, // Mantener para compatibilidad
    maxRetries: 2,
    cost: 20,
    minImprovementPercentage: 8, // 8% mejora mínima
    fallbackMinScore: 65 // Score mínimo absoluto
  },
  specialized: {
    type: 'specialized',
    steps: [
      AI_AGENTS.CONTENT_ENHANCER,
      AI_AGENTS.POSITION_ENHANCER,
      AI_AGENTS.INDUSTRY_RECRUITER,
      AI_AGENTS.EXPERT_RECRUITER,
      AI_AGENTS.HEAD_HUNTER,
      AI_AGENTS.HUMANIZER
    ],
    minScore: 80, // Mantener para compatibilidad
    maxRetries: 2,
    cost: 25,
    minImprovementPercentage: 10, // 10% mejora mínima
    fallbackMinScore: 70 // Score mínimo absoluto
  }
};

// Frases humanizadas para cada IA
export const AI_STATUS_MESSAGES: Record<string, string[]> = {
  analyst: [
    "🔍 Nuestro auditor está examinando cada línea de tu CV...",
    "📊 Comparando con estándares de industria...",
    "🎯 Identificando oportunidades de mejora...",
    "📋 Generando diagnóstico completo..."
  ],
  'content-enhancer': [
    "✍️ El editor profesional está reescribiendo tu experiencia...",
    "📝 Mejorando estructura y contenido...",
    "🔄 Reorganizando secciones para mayor impacto...",
    "💪 Potenciando el lenguaje de tus logros..."
  ],
  'industry-recruiter': [
    "🏭 El especialista en tu industria está optimizando keywords...",
    "🎯 Aplicando expertise sectorial específico...",
    "📈 Alineando con estándares de tu sector...",
    "🔍 Integrando terminología especializada..."
  ],
  'position-enhancer': [
    "🎯 Alineando tu perfil al puesto de tus sueños...",
    "📋 Analizando requirements del trabajo objetivo...",
    "🔄 Priorizando experiencia más relevante...",
    "⚡ Personalizando para match perfecto..."
  ],
  'expert-recruiter': [
    "👔 El recruiter experto está haciendo la validación final...",
    "🔍 Verificando compatibilidad con sistemas ATS...",
    "⚠️ Identificando y eliminando red flags...",
    "✅ Aplicando criterios de reclutador experimentado..."
  ],
  'head-hunter': [
    "💎 Refinando tu CV a nivel ejecutivo...",
    "🏆 Aplicando lenguaje de alto impacto empresarial...",
    "👑 Optimizando para roles senior y ejecutivos...",
    "⭐ Elevando a estándares C-suite..."
  ],
  humanizer: [
    "🎨 Aplicando el formato perfecto y verificando compatibilidad ATS...",
    "📄 Generando PDF final listo para enviar...",
    "✅ Realizando verificaciones finales de calidad...",
    "🔗 Asegurando que todos los enlaces funcionen correctamente..."
  ]
};

export type AIAgentId = keyof typeof AI_AGENTS;
export type PipelineType = keyof typeof PIPELINE_CONFIGS;