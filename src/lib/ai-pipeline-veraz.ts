// Pipeline Veraz de 6 IAs + Fact Checker
// Arquitectura ultra-conservadora que nunca inventa información

import OpenAI from 'openai';
import { 
  AIAgent, 
  PipelineConfig, 
  PipelineStep, 
  PipelineResult, 
  CheckpointResult,
  CVAnalysisResult,
  EnhancementResult,
  UserProfile,
  JobContext,
  PipelineProgress,
  PIPELINE_CONFIGS,
  AI_STATUS_MESSAGES,
  AIAgentId,
  TextExtractionResult,
  StructuredFeedback,
  FactCheckResult
} from '@/types/ai-pipeline';
import { AIPromptsVeraz } from './ai-prompts-veraz';
import { FactChecker } from './fact-checker';
import { ProgressiveImprovementSystem } from './progressive-improvement';

export class AIPipelineVeraz {
  private openai: OpenAI;
  private onProgress?: (progress: PipelineProgress) => void;

  constructor(onProgress?: (progress: PipelineProgress) => void) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.onProgress = onProgress;
  }

  // Función principal para ejecutar el pipeline veraz
  async executePipeline(
    type: 'analysis' | 'simple' | 'advanced' | 'specialized',
    cvText: string,
    options: {
      userProfile?: UserProfile;
      jobContext?: JobContext;
      userId: string;
      resumeId: string;
    }
  ): Promise<PipelineResult> {
    const startTime = Date.now();
    const config = PIPELINE_CONFIGS[type];
    const steps: PipelineStep[] = [];
    
    console.log(`🚀 Iniciando pipeline VERAZ ${type.toUpperCase()} con ${config.steps.length} IAs`);

    try {
      // Variables para mantener el flujo de datos
      let originalText = cvText;
      let extractedContent: any = null;
      let structuredFeedback: StructuredFeedback | null = null;
      let improvedContent = '';
      let industryFeedback: any = null;
      let jobMatcherChanges: any = null;
      let finalContent = '';
      let factCheckResult: FactCheckResult | null = null;
      let retryCount = 0;

      // Ejecutar cada paso del pipeline
      for (let i = 0; i < config.steps.length; i++) {
        const agent = config.steps[i];
        
        let step: PipelineStep;
        
        // Ejecutar cada IA según su especialización
        switch (agent.id) {
          case 'extractor':
            step = await this.executeExtractor(agent, originalText, i + 1, config.steps.length);
            if (step.status === 'completed') {
              extractedContent = step.output;
            }
            break;
            
          case 'analyzer':
            step = await this.executeAnalyzer(
              agent, originalText, extractedContent, options.userProfile, i + 1, config.steps.length
            );
            if (step.status === 'completed') {
              structuredFeedback = step.output.structuredFeedback;
            }
            break;
            
          case 'a1-content-improver':
            step = await this.executeA1ContentImprover(
              agent, originalText, extractedContent, structuredFeedback, options.userProfile, i + 1, config.steps.length
            );
            if (step.status === 'completed') {
              improvedContent = step.output;
            }
            break;
            
          case 'a2-industry-judge':
            const industry = options.userProfile?.industry || 'tecnologia';
            step = await this.executeA2IndustryJudge(
              agent, originalText, improvedContent, industry, structuredFeedback, i + 1, config.steps.length
            );
            if (step.status === 'completed') {
              industryFeedback = step.output;
            }
            break;
            
          case 'a3-job-matcher':
            if (!options.jobContext) {
              throw new Error('Job context required for A3 Job Matcher');
            }
            step = await this.executeA3JobMatcher(
              agent, originalText, improvedContent, options.jobContext, industryFeedback, i + 1, config.steps.length
            );
            if (step.status === 'completed') {
              jobMatcherChanges = step.output;
            }
            break;
            
          case 'a4-final-enhancer':
            const allFeedback = {
              structuredFeedback,
              industryFeedback,
              jobMatcherChanges
            };
            step = await this.executeA4FinalEnhancer(
              agent, originalText, improvedContent, allFeedback, jobMatcherChanges, i + 1, config.steps.length
            );
            if (step.status === 'completed') {
              finalContent = step.output;
            }
            break;
            
          case 'fact-checker':
            const contentToCheck = finalContent || improvedContent;
            step = await this.executeFactChecker(
              agent, originalText, contentToCheck, i + 1, config.steps.length
            );
            if (step.status === 'completed') {
              factCheckResult = step.output;
              
              // CHECKPOINT CRÍTICO: Si Fact Checker falla, reiniciar
              if (!factCheckResult.isVerified) {
                if (retryCount < config.maxRetries) {
                  console.log(`🛡️ FACT CHECK FAILED - Información inventada detectada. Reiniciando pipeline...`);
                  console.log('Violaciones:', factCheckResult.inventedInfo);
                  
                  retryCount++;
                  i = 1; // Reiniciar desde A1 (después de extractor y analyzer)
                  steps.length = 0; // Limpiar steps previos
                  improvedContent = '';
                  finalContent = '';
                  continue;
                } else {
                  throw new Error(
                    `FACT CHECK FAILED: Se detectó información inventada después de ${retryCount} intentos. ` +
                    `Violaciones: ${factCheckResult.inventedInfo.join(', ')}`
                  );
                }
              }
            }
            break;
            
          case 'a5-html-formatter':
            step = await this.executeA5HtmlFormatter(
              agent, finalContent, i + 1, config.steps.length
            );
            if (step.status === 'completed') {
              finalContent = step.output;
            }
            break;
            
          default:
            throw new Error(`Unknown agent: ${agent.id}`);
        }

        steps.push(step);

        if (step.status === 'failed') {
          throw new Error(`Step ${agent.name} failed: ${step.error}`);
        }
      }

      // Calcular score final
      const finalScore = this.calculateFinalScore(steps, structuredFeedback);
      const totalTime = Date.now() - startTime;

      // Preparar resultado
      const result: PipelineResult = {
        success: true,
        type,
        steps,
        finalScore,
        result: type === 'analysis' ? {
          ...structuredFeedback,
          overallScore: finalScore
        } as CVAnalysisResult : {
          enhancedContent: finalContent,
          improvementsSummary: this.extractImprovements(steps),
          scoreImprovement: {
            before: structuredFeedback?.resumenProfesional?.score || 0,
            after: finalScore,
            improvement: finalScore - (structuredFeedback?.resumenProfesional?.score || 0)
          },
          changesExplanation: this.generateChangesExplanation(steps),
          factCheckResult: factCheckResult!
        } as EnhancementResult,
        totalTime,
        creditsUsed: config.cost
      };

      console.log(`✅ Pipeline VERAZ ${type} completado exitosamente`);
      console.log(`🛡️ Fact Check: ${factCheckResult?.isVerified ? 'VERIFICADO' : 'FALLIDO'}`);
      console.log(`📊 Score final: ${finalScore}/100`);
      
      return result;

    } catch (error) {
      console.error(`❌ Error en pipeline VERAZ ${type}:`, error);
      
      const totalTime = Date.now() - startTime;
      return {
        success: false,
        type,
        steps,
        finalScore: 0,
        result: type === 'analysis' ? {} as CVAnalysisResult : {
          enhancedContent: '',
          improvementsSummary: [],
          scoreImprovement: { before: 0, after: 0, improvement: 0 },
          changesExplanation: '',
          factCheckResult: {
            isVerified: false,
            originalText: cvText,
            enhancedText: '',
            inventedInfo: ['Pipeline failed'],
            changesDetected: [],
            confidenceScore: 0,
            flaggedSections: ['error']
          }
        } as EnhancementResult,
        totalTime,
        creditsUsed: 0, // No cobrar si falla
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Ejecutar EXTRACTOR
  private async executeExtractor(
    agent: AIAgent,
    cvText: string,
    currentStep: number,
    totalSteps: number
  ): Promise<PipelineStep> {
    return this.executeGenericStep(
      agent,
      cvText,
      () => AIPromptsVeraz.getExtractorPrompt(cvText),
      currentStep,
      totalSteps,
      true // Parse JSON
    );
  }

  // Ejecutar ANALYZER
  private async executeAnalyzer(
    agent: AIAgent,
    originalText: string,
    extractedContent: any,
    userProfile: UserProfile | undefined,
    currentStep: number,
    totalSteps: number
  ): Promise<PipelineStep> {
    return this.executeGenericStep(
      agent,
      originalText,
      () => AIPromptsVeraz.getAnalyzerPrompt(originalText, extractedContent, userProfile),
      currentStep,
      totalSteps,
      true // Parse JSON
    );
  }

  // Ejecutar A1 - Content Improver
  private async executeA1ContentImprover(
    agent: AIAgent,
    originalText: string,
    extractedContent: any,
    structuredFeedback: StructuredFeedback | null,
    userProfile: UserProfile | undefined,
    currentStep: number,
    totalSteps: number
  ): Promise<PipelineStep> {
    if (!structuredFeedback) {
      throw new Error('Structured feedback required for A1 Content Improver');
    }
    
    return this.executeGenericStep(
      agent,
      originalText,
      () => AIPromptsVeraz.getA1ContentImproverPrompt(originalText, extractedContent, structuredFeedback, userProfile),
      currentStep,
      totalSteps,
      false // No parse JSON
    );
  }

  // Ejecutar A2 - Industry Judge
  private async executeA2IndustryJudge(
    agent: AIAgent,
    originalText: string,
    improvedContent: string,
    industry: string,
    structuredFeedback: StructuredFeedback | null,
    currentStep: number,
    totalSteps: number
  ): Promise<PipelineStep> {
    if (!structuredFeedback) {
      throw new Error('Structured feedback required for A2 Industry Judge');
    }
    
    return this.executeGenericStep(
      agent,
      originalText,
      () => AIPromptsVeraz.getA2IndustryJudgePrompt(originalText, improvedContent, industry, structuredFeedback),
      currentStep,
      totalSteps,
      true // Parse JSON
    );
  }

  // Ejecutar A3 - Job Matcher
  private async executeA3JobMatcher(
    agent: AIAgent,
    originalText: string,
    improvedContent: string,
    jobContext: JobContext,
    industryFeedback: any,
    currentStep: number,
    totalSteps: number
  ): Promise<PipelineStep> {
    return this.executeGenericStep(
      agent,
      originalText,
      () => AIPromptsVeraz.getA3JobMatcherPrompt(originalText, improvedContent, jobContext, industryFeedback),
      currentStep,
      totalSteps,
      true // Parse JSON
    );
  }

  // Ejecutar A4 - Final Enhancer
  private async executeA4FinalEnhancer(
    agent: AIAgent,
    originalText: string,
    improvedContent: string,
    allFeedback: any,
    jobMatcherChanges: any,
    currentStep: number,
    totalSteps: number
  ): Promise<PipelineStep> {
    return this.executeGenericStep(
      agent,
      originalText,
      () => AIPromptsVeraz.getA4FinalEnhancerPrompt(originalText, improvedContent, allFeedback, jobMatcherChanges),
      currentStep,
      totalSteps,
      false // No parse JSON
    );
  }

  // Ejecutar Fact Checker
  private async executeFactChecker(
    agent: AIAgent,
    originalText: string,
    enhancedContent: string,
    currentStep: number,
    totalSteps: number
  ): Promise<PipelineStep> {
    const step: PipelineStep = {
      agent,
      status: 'processing',
      startTime: new Date(),
      input: enhancedContent
    };

    // Notificar progreso
    if (this.onProgress) {
      const progress: PipelineProgress = {
        currentStep,
        totalSteps,
        currentAgent: agent,
        progressPercentage: ((currentStep - 1) / totalSteps) * 100,
        estimatedTimeRemaining: (totalSteps - currentStep + 1) * agent.estimatedTime,
        statusMessage: this.getRandomStatusMessage(agent.id as AIAgentId)
      };
      this.onProgress(progress);
    }

    try {
      console.log(`🛡️ Ejecutando ${agent.name}...`);
      
      // Ejecutar Fact Checker
      const factCheckResult = await FactChecker.verifyContent(originalText, enhancedContent);

      step.status = 'completed';
      step.endTime = new Date();
      step.output = factCheckResult;
      step.score = factCheckResult.confidenceScore;

      console.log(`${factCheckResult.isVerified ? '✅' : '❌'} ${agent.name} completado - Verificado: ${factCheckResult.isVerified}`);
      return step;

    } catch (error) {
      console.error(`❌ Error en ${agent.name}:`, error);
      step.status = 'failed';
      step.endTime = new Date();
      step.error = error instanceof Error ? error.message : 'Unknown error';
      return step;
    }
  }

  // Ejecutar A5 - HTML Formatter
  private async executeA5HtmlFormatter(
    agent: AIAgent,
    finalContent: string,
    currentStep: number,
    totalSteps: number
  ): Promise<PipelineStep> {
    return this.executeGenericStep(
      agent,
      finalContent,
      () => AIPromptsVeraz.getA5HtmlFormatterPrompt(finalContent),
      currentStep,
      totalSteps,
      false // No parse JSON
    );
  }

  // Función genérica para ejecutar pasos con OpenAI
  private async executeGenericStep(
    agent: AIAgent,
    input: string,
    promptGenerator: () => { systemPrompt: string; userPrompt: string },
    currentStep: number,
    totalSteps: number,
    parseJSON: boolean = false
  ): Promise<PipelineStep> {
    const step: PipelineStep = {
      agent,
      status: 'processing',
      startTime: new Date(),
      input
    };

    // Notificar progreso
    if (this.onProgress) {
      const progress: PipelineProgress = {
        currentStep,
        totalSteps,
        currentAgent: agent,
        progressPercentage: ((currentStep - 1) / totalSteps) * 100,
        estimatedTimeRemaining: (totalSteps - currentStep + 1) * agent.estimatedTime,
        statusMessage: this.getRandomStatusMessage(agent.id as AIAgentId)
      };
      this.onProgress(progress);
    }

    try {
      console.log(`🔄 Ejecutando ${agent.name}...`);
      
      const prompt = promptGenerator();
      
      // Ejecutar llamada a OpenAI con temperatura más conservadora
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2, // Más conservador para mantener veracidad
        max_tokens: 8000,
        messages: [
          { role: 'system', content: prompt.systemPrompt },
          { role: 'user', content: prompt.userPrompt }
        ],
      });

      const output = response.choices[0]?.message?.content || '';
      
      if (!output.trim()) {
        throw new Error(`Empty response from ${agent.name}`);
      }

      // Procesar output
      let processedOutput: any = output;
      if (parseJSON) {
        try {
          processedOutput = JSON.parse(output);
        } catch {
          console.warn(`Warning: ${agent.name} did not return valid JSON, using raw output`);
          processedOutput = output;
        }
      }

      step.status = 'completed';
      step.endTime = new Date();
      step.output = processedOutput;
      step.score = this.extractScoreFromOutput(processedOutput);

      console.log(`✅ ${agent.name} completado - Score: ${step.score || 'N/A'}`);
      return step;

    } catch (error) {
      console.error(`❌ Error en ${agent.name}:`, error);
      step.status = 'failed';
      step.endTime = new Date();
      step.error = error instanceof Error ? error.message : 'Unknown error';
      return step;
    }
  }

  // Funciones helper (reutilizadas del pipeline original)
  private getRandomStatusMessage(agentId: AIAgentId): string {
    const messages = AI_STATUS_MESSAGES[agentId] || ['Procesando...'];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private extractScoreFromOutput(output: any): number {
    if (typeof output === 'object') {
      if (output.overallScore) return output.overallScore;
      if (output.industryScore) return output.industryScore;
      if (output.matchScore) return output.matchScore;
      if (output.confidenceScore) return output.confidenceScore;
    }
    if (typeof output === 'string') {
      const scoreMatch = output.match(/score[:\s]*(\d+)/i);
      if (scoreMatch) {
        return parseInt(scoreMatch[1]);
      }
    }
    return 0;
  }

  private calculateFinalScore(steps: PipelineStep[], structuredFeedback: StructuredFeedback | null): number {
    // Buscar score del analyzer
    const analyzerStep = steps.find(step => step.agent.id === 'analyzer');
    if (analyzerStep?.score) {
      return analyzerStep.score;
    }

    // Calcular promedio de scores de secciones
    if (structuredFeedback) {
      const sectionScores = [
        structuredFeedback.resumenProfesional.score,
        structuredFeedback.experienciaLaboral.score,
        structuredFeedback.educacion.score,
        structuredFeedback.habilidades.score,
        structuredFeedback.otros.score
      ];
      return Math.round(sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length);
    }

    // Fallback
    const scores = steps.filter(step => step.score).map(step => step.score!);
    if (scores.length > 0) {
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    return 0;
  }

  private extractImprovements(steps: PipelineStep[]): string[] {
    const improvements: string[] = [];
    
    steps.forEach(step => {
      switch (step.agent.id) {
        case 'extractor':
          improvements.push('Texto extraído y preservado exactamente');
          break;
        case 'analyzer':
          improvements.push('Análisis crítico estructurado completado');
          break;
        case 'a1-content-improver':
          improvements.push('Contenido mejorado conservadoramente sin inventar información');
          break;
        case 'a2-industry-judge':
          improvements.push('Evaluación sectorial específica aplicada');
          break;
        case 'a3-job-matcher':
          improvements.push('Alineación específica al puesto objetivo');
          break;
        case 'a4-final-enhancer':
          improvements.push('Integración final de todas las mejoras');
          break;
        case 'fact-checker':
          improvements.push('Verificación de veracidad completada');
          break;
        case 'a5-html-formatter':
          improvements.push('Formato HTML profesional aplicado');
          break;
      }
    });

    return improvements;
  }

  private generateChangesExplanation(steps: PipelineStep[]): string {
    const changes = steps.map(step => {
      switch (step.agent.id) {
        case 'extractor':
          return 'Extrajimos el texto original preservando información exacta';
        case 'analyzer':
          return 'Analizamos críticamente cada sección identificando problemas específicos';
        case 'a1-content-improver':
          return 'Mejoramos la redacción y estructura basándonos únicamente en información real';
        case 'a2-industry-judge':
          return 'Evaluamos desde perspectiva sectorial identificando gaps específicos';
        case 'a3-job-matcher':
          return 'Propusimos cambios específicos para alinear al puesto objetivo';
        case 'a4-final-enhancer':
          return 'Integramos todas las mejoras manteniendo veracidad absoluta';
        case 'fact-checker':
          return 'Verificamos que no se haya inventado información alguna';
        case 'a5-html-formatter':
          return 'Aplicamos formato profesional sin modificar contenido';
        default:
          return `Procesamiento completado por ${step.agent.name}`;
      }
    });

    return changes.join('. ');
  }
}

// Factory function para crear pipeline veraz
export function createAIPipelineVeraz(onProgress?: (progress: PipelineProgress) => void): AIPipelineVeraz {
  return new AIPipelineVeraz(onProgress);
}