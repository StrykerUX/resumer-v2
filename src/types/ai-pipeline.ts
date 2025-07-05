// Tipos para el sistema de Pipeline Veraz de 6 IAs + Fact Checker

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  role: string;
  function: string;
  estimatedTime: number; // en segundos
  conservative: boolean; // Nueva propiedad para IAs ultra-conservadoras
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

// Nuevo sistema de retroalimentación estructurada por secciones
export interface SectionFeedback {
  problemas: string[];
  sugerencias: string[];
  score: number;
}

export interface StructuredFeedback {
  resumenProfesional: SectionFeedback;
  experienciaLaboral: SectionFeedback;
  educacion: SectionFeedback;
  habilidades: SectionFeedback;
  otros: SectionFeedback;
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
  // Nuevo sistema de retroalimentación estructurada
  structuredFeedback: StructuredFeedback;
}

// Resultado de extracción de texto plano
export interface TextExtractionResult {
  originalText: string;
  extractedContent: {
    informacionContacto: string;
    resumenProfesional: string;
    experienciaLaboral: string;
    educacion: string;
    habilidades: string;
    otros: string;
  };
  wordCount: number;
  sectionsFound: string[];
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
  // Nuevo campo para validación de veracidad
  factCheckResult: FactCheckResult;
}

// Resultado del Fact Checker
export interface FactCheckResult {
  isVerified: boolean;
  originalText: string;
  enhancedText: string;
  inventedInfo: string[];
  changesDetected: string[];
  confidenceScore: number;
  flaggedSections: string[];
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

// Constantes para las 6 IAs especializadas + Fact Checker
export const AI_AGENTS: Record<string, AIAgent> = {
  // Pre-Pipeline
  EXTRACTOR: {
    id: 'extractor',
    name: 'Text Extractor',
    description: 'Extractor de texto puro sin modificaciones',
    role: 'Extracción de texto sin interpretar',
    function: 'Texto plano sin modificaciones',
    estimatedTime: 30,
    conservative: true
  },
  ANALYZER: {
    id: 'analyzer',
    name: 'Analyzer Crítico',
    description: 'El Destructor - Análisis crítico estructurado por secciones',
    role: 'Análisis crítico destructivo por secciones',
    function: 'Retroalimentación estructurada por secciones',
    estimatedTime: 90,
    conservative: true
  },
  
  // Pipeline IAs
  A1_CONTENT_IMPROVER: {
    id: 'a1-content-improver',
    name: 'A1 Content Improver',
    description: 'El Conservador - Mejora sin inventar información',
    role: 'Mejora conservadora manteniendo veracidad',
    function: 'CV mejorado sin información inventada',
    estimatedTime: 120,
    conservative: true
  },
  A2_INDUSTRY_JUDGE: {
    id: 'a2-industry-judge',
    name: 'A2 Industry Judge',
    description: 'El Especialista Sectorial - Evaluación por industria',
    role: 'Evaluación específica por industria',
    function: 'Retroalimentación sectorial específica',
    estimatedTime: 80,
    conservative: true
  },
  A3_JOB_MATCHER: {
    id: 'a3-job-matcher',
    name: 'A3 Job Matcher',
    description: 'El Alineador - Propone cambios específicos al puesto',
    role: 'Alineación específica al puesto objetivo',
    function: 'Cambios específicos para el puesto',
    estimatedTime: 100,
    conservative: true
  },
  A4_FINAL_ENHANCER: {
    id: 'a4-final-enhancer',
    name: 'A4 Final Enhancer',
    description: 'El Pulidor - Integración final sin inventar',
    role: 'Integración final de todas las mejoras',
    function: 'CV final integrado y pulido',
    estimatedTime: 110,
    conservative: true
  },
  A5_HTML_FORMATTER: {
    id: 'a5-html-formatter',
    name: 'A5 HTML Formatter',
    description: 'El Presentador - Solo formato sin contenido',
    role: 'Formato HTML sin modificar contenido',
    function: 'CV con formato HTML final',
    estimatedTime: 60,
    conservative: true
  },
  
  // Fact Checker
  FACT_CHECKER: {
    id: 'fact-checker',
    name: 'Fact Checker',
    description: 'El Guardián - Validación de veracidad',
    role: 'Validación contra texto original',
    function: 'Verificación de veracidad completa',
    estimatedTime: 70,
    conservative: true
  }
};

// Configuraciones de pipeline por tipo - Nueva Arquitectura Veraz
export const PIPELINE_CONFIGS: Record<string, PipelineConfig> = {
  analysis: {
    type: 'analysis',
    steps: [AI_AGENTS.EXTRACTOR, AI_AGENTS.ANALYZER],
    minScore: 0,
    maxRetries: 1,
    cost: 10,
    minImprovementPercentage: 0, // No aplica para análisis
    fallbackMinScore: 0
  },
  simple: {
    type: 'simple',
    steps: [
      AI_AGENTS.EXTRACTOR,
      AI_AGENTS.ANALYZER,
      AI_AGENTS.A1_CONTENT_IMPROVER,
      AI_AGENTS.FACT_CHECKER,
      AI_AGENTS.A5_HTML_FORMATTER
    ],
    minScore: 70, // Mantener para compatibilidad
    maxRetries: 2,
    cost: 20,
    minImprovementPercentage: 5, // 5% mejora mínima
    fallbackMinScore: 60 // Score mínimo absoluto
  },
  advanced: {
    type: 'advanced',
    steps: [
      AI_AGENTS.EXTRACTOR,
      AI_AGENTS.ANALYZER,
      AI_AGENTS.A1_CONTENT_IMPROVER,
      AI_AGENTS.A2_INDUSTRY_JUDGE,
      AI_AGENTS.A4_FINAL_ENHANCER,
      AI_AGENTS.FACT_CHECKER,
      AI_AGENTS.A5_HTML_FORMATTER
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
      AI_AGENTS.EXTRACTOR,
      AI_AGENTS.ANALYZER,
      AI_AGENTS.A1_CONTENT_IMPROVER,
      AI_AGENTS.A2_INDUSTRY_JUDGE,
      AI_AGENTS.A3_JOB_MATCHER,
      AI_AGENTS.A4_FINAL_ENHANCER,
      AI_AGENTS.FACT_CHECKER,
      AI_AGENTS.A5_HTML_FORMATTER
    ],
    minScore: 80, // Mantener para compatibilidad
    maxRetries: 2,
    cost: 25,
    minImprovementPercentage: 10, // 10% mejora mínima
    fallbackMinScore: 70 // Score mínimo absoluto
  }
};

// Frases humanizadas para cada IA - Nueva Arquitectura Veraz
export const AI_STATUS_MESSAGES: Record<string, string[]> = {
  extractor: [
    "🔍 Extrayendo texto original sin modificaciones...",
    "📝 Capturando información exacta del CV...",
    "🎯 Preservando contenido original intacto...",
    "📋 Organizando texto por secciones..."
  ],
  analyzer: [
    "🔥 El Destructor está siendo despiadado con tu CV...",
    "⚡ Analizando cada sección con crítica feroz...",
    "📊 Identificando problemas sin piedad...",
    "🎯 Generando retroalimentación estructurada..."
  ],
  'a1-content-improver': [
    "✍️ El Conservador está mejorando tu contenido sin inventar...",
    "🔒 Manteniendo veracidad mientras optimiza...",
    "📝 Reescribiendo con base en información real...",
    "💪 Potenciando lo que ya tienes..."
  ],
  'a2-industry-judge': [
    "🏭 El Especialista Sectorial está evaluando por industria...",
    "📈 Aplicando criterios específicos del sector...",
    "🎯 Generando retroalimentación sectorial...",
    "🔍 Identificando gaps específicos de la industria..."
  ],
  'a3-job-matcher': [
    "🎯 El Alineador está proponiendo cambios específicos...",
    "📋 Analizando requirements del puesto objetivo...",
    "🔄 Sugiriendo ajustes precisos para el rol...",
    "⚡ Creando propuesta de personalización..."
  ],
  'a4-final-enhancer': [
    "💎 El Pulidor está integrando todas las mejoras...",
    "🔗 Combinando feedback sin inventar información...",
    "✨ Aplicando mejoras finales conservadoras...",
    "🎯 Generando versión final optimizada..."
  ],
  'a5-html-formatter': [
    "🎨 El Presentador está aplicando formato HTML...",
    "📄 Generando estructura visual perfecta...",
    "✅ Optimizando para compatibilidad ATS...",
    "🔗 Finalizando presentación profesional..."
  ],
  'fact-checker': [
    "🛡️ El Guardián está validando veracidad...",
    "🔍 Comparando con texto original línea por línea...",
    "⚠️ Detectando cualquier información inventada...",
    "✅ Certificando autenticidad del contenido..."
  ]
};

export type AIAgentId = keyof typeof AI_AGENTS;
export type PipelineType = keyof typeof PIPELINE_CONFIGS;