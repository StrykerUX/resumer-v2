// Pipeline Principal de las 7 IAs Especializadas

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
  AIAgentId
} from '@/types/ai-pipeline';
import { AIPrompts } from './ai-prompts';
import { ProgressiveImprovementSystem } from './progressive-improvement';

export class AIPipeline {
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

  // Función principal para ejecutar el pipeline
  async executePipeline(
    type: 'analysis' | 'simple' | 'advanced' | 'specialized',
    cvText: string,
    options: {
      userProfile?: UserProfile;
      jobContext?: JobContext;
      userId: string;
      resumeId: string;
      analysisResult?: any; // Score inicial del análisis
    }
  ): Promise<PipelineResult> {
    const startTime = Date.now();
    const config = PIPELINE_CONFIGS[type];
    const steps: PipelineStep[] = [];
    
    console.log(`🚀 Iniciando pipeline ${type.toUpperCase()} con ${config.steps.length} IAs`);

    try {
      let currentData = cvText;
      let analysisResult: any = options.analysisResult || null;
      let expertFeedback: any = null;
      let retryCount = 0;
      
      // Obtener score inicial para sistema de mejora progresiva
      const initialScore = analysisResult?.overallScore || 0;

      // Ejecutar cada paso del pipeline
      for (let i = 0; i < config.steps.length; i++) {
        const agent = config.steps[i];
        const step = await this.executeStep(
          agent, 
          currentData, 
          analysisResult,
          expertFeedback,
          options,
          i + 1,
          config.steps.length
        );
        
        steps.push(step);

        if (step.status === 'failed') {
          throw new Error(`Step ${agent.name} failed: ${step.error}`);
        }

        // Actualizar datos para el siguiente paso
        if (agent.id === 'analyst') {
          analysisResult = step.output;
        } else if (agent.id === 'expert-recruiter') {
          expertFeedback = step.output;
        } else if (step.output && typeof step.output === 'string') {
          currentData = step.output;
        }

        // Checkpoint de calidad (excepto para análisis standalone)
        if (type !== 'analysis' && agent.id === 'expert-recruiter') {
          const checkpoint = await this.runProgressiveCheckpoint(
            initialScore,
            step.output, 
            type as 'simple' | 'advanced' | 'specialized',
            retryCount, 
            config.maxRetries
          );
          
          if (!checkpoint.passed && checkpoint.shouldRetry) {
            if (checkpoint.improvementType === 'progressive') {
              console.log(`🔄 Checkpoint falló (Mejora: ${checkpoint.improvementPercentage?.toFixed(1)}%/${checkpoint.minRequiredImprovement?.toFixed(1)}%). Reiniciando pipeline...`);
            } else {
              console.log(`🔄 Checkpoint falló (Score: ${checkpoint.score}/${config.minScore}). Reiniciando pipeline...`);
            }
            retryCount++;
            
            // Reiniciar desde Content Enhancer o Position Enhancer según el tipo
            const restartIndex = type === 'specialized' ? 1 : 0; // Position Enhancer para specialized, Content Enhancer para otros
            i = restartIndex - 1; // -1 porque el loop incrementará
            currentData = cvText;
            steps.length = 0; // Limpiar steps previos
            continue;
          } else if (!checkpoint.passed && !checkpoint.shouldRetry) {
            // Refund automático
            console.log(`❌ Checkpoint falló después de ${retryCount} intentos. Refund automático.`);
            throw new Error(`Quality checkpoint failed after ${retryCount} retries. Automatic refund initiated.`);
          }
        }
      }

      // Calcular score final
      const finalScore = this.calculateFinalScore(steps, analysisResult);
      const totalTime = Date.now() - startTime;

      // Preparar resultado
      const result: PipelineResult = {
        success: true,
        type,
        steps,
        finalScore,
        result: type === 'analysis' ? analysisResult : {
          enhancedContent: currentData,
          improvementsSummary: this.extractImprovements(steps),
          scoreImprovement: {
            before: analysisResult?.overallScore || 0,
            after: finalScore,
            improvement: finalScore - (analysisResult?.overallScore || 0)
          },
          changesExplanation: this.generateChangesExplanation(steps)
        } as EnhancementResult,
        totalTime,
        creditsUsed: config.cost
      };

      console.log(`✅ Pipeline ${type} completado exitosamente - Score: ${finalScore}/100`);
      return result;

    } catch (error) {
      console.error(`❌ Error en pipeline ${type}:`, error);
      
      const totalTime = Date.now() - startTime;
      return {
        success: false,
        type,
        steps,
        finalScore: 0,
        result: type === 'analysis' ? {} as CVAnalysisResult : {} as EnhancementResult,
        totalTime,
        creditsUsed: 0, // No cobrar si falla
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Ejecutar un paso individual del pipeline
  private async executeStep(
    agent: AIAgent,
    input: string,
    analysisResult: any,
    expertFeedback: any,
    options: any,
    currentStep: number,
    totalSteps: number
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
      
      let prompt: { systemPrompt: string; userPrompt: string };
      
      // Generar prompts específicos para cada IA
      switch (agent.id) {
        case 'analyst':
          prompt = AIPrompts.getAnalystPrompt(input, options.userProfile);
          break;
          
        case 'content-enhancer':
          prompt = AIPrompts.getContentEnhancerPrompt(input, analysisResult, options.userProfile);
          break;
          
        case 'industry-recruiter':
          const industry = options.userProfile?.industry || 'tecnologia';
          prompt = AIPrompts.getIndustryRecruiterPrompt(input, industry, analysisResult);
          break;
          
        case 'position-enhancer':
          if (!options.jobContext) {
            throw new Error('Job context required for Position Enhancer');
          }
          prompt = AIPrompts.getPositionEnhancerPrompt(input, options.jobContext, analysisResult);
          break;
          
        case 'expert-recruiter':
          const enhancementType = this.getEnhancementType(totalSteps);
          prompt = AIPrompts.getExpertRecruiterPrompt(input, analysisResult, enhancementType);
          break;
          
        case 'head-hunter':
          prompt = AIPrompts.getHeadHunterPrompt(input, expertFeedback, analysisResult);
          break;
          
        case 'humanizer':
          const finalScore = expertFeedback?.overallScore || analysisResult?.overallScore || 0;
          const pipelineType = this.getEnhancementType(totalSteps);
          prompt = AIPrompts.getHumanizerPrompt(input, finalScore, pipelineType);
          break;
          
        default:
          throw new Error(`Unknown agent: ${agent.id}`);
      }

      // Ejecutar llamada a OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: agent.id === 'analyst' || agent.id === 'expert-recruiter' ? 0.3 : 0.5,
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

      // Procesar output específico por tipo de IA
      let processedOutput: any = output;
      if (agent.id === 'analyst' || agent.id === 'expert-recruiter') {
        try {
          // Intentar parsear JSON para IAs que devuelven datos estructurados
          processedOutput = JSON.parse(output);
        } catch {
          // Si no es JSON válido, mantener como string
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

  // Sistema de checkpoints automáticos (legacy - mantener para compatibilidad)
  private async runCheckpoint(
    output: any,
    minScore: number,
    retryCount: number,
    maxRetries: number
  ): Promise<CheckpointResult> {
    const score = this.extractScoreFromOutput(output);
    const passed = score >= minScore;
    const shouldRetry = !passed && retryCount < maxRetries;

    return {
      passed,
      score,
      minRequired: minScore,
      shouldRetry,
      retryCount,
      maxRetries,
      improvementType: 'absolute'
    };
  }

  // Sistema de checkpoints progresivos (nuevo)
  private async runProgressiveCheckpoint(
    originalScore: number,
    output: any,
    pipelineType: 'simple' | 'advanced' | 'specialized',
    retryCount: number,
    maxRetries: number
  ): Promise<CheckpointResult> {
    const currentScore = this.extractScoreFromOutput(output);
    
    // Usar sistema de mejora progresiva
    const improvementResult = ProgressiveImprovementSystem.evaluateImprovement(
      originalScore,
      currentScore,
      pipelineType
    );
    
    const shouldRetry = !improvementResult.passed && retryCount < maxRetries;
    
    console.log(`📊 Checkpoint Progresivo:`, {
      scoreInicial: originalScore,
      scoreActual: currentScore,
      mejora: `${improvementResult.improvementPercentage.toFixed(1)}%`,
      requerida: `${improvementResult.adaptedMinImprovement.toFixed(1)}%`,
      resultado: improvementResult.passed ? '✅ APROBADO' : '❌ RECHAZADO'
    });

    return {
      passed: improvementResult.passed,
      score: currentScore,
      minRequired: improvementResult.minRequiredImprovement,
      shouldRetry,
      retryCount,
      maxRetries,
      originalScore,
      improvementPercentage: improvementResult.improvementPercentage,
      minRequiredImprovement: improvementResult.adaptedMinImprovement,
      improvementType: 'progressive'
    };
  }

  // Funciones helper
  private getRandomStatusMessage(agentId: AIAgentId): string {
    const messages = AI_STATUS_MESSAGES[agentId] || ['Procesando...'];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getEnhancementType(totalSteps: number): 'simple' | 'advanced' | 'specialized' {
    if (totalSteps === 2) return 'simple';
    if (totalSteps === 5) return 'advanced';
    return 'specialized';
  }

  private extractScoreFromOutput(output: any): number {
    if (typeof output === 'object' && output.overallScore) {
      return output.overallScore;
    }
    if (typeof output === 'string') {
      const scoreMatch = output.match(/score[:\s]*(\d+)/i);
      if (scoreMatch) {
        return parseInt(scoreMatch[1]);
      }
    }
    return 0;
  }

  private calculateFinalScore(steps: PipelineStep[], analysisResult: any): number {
    // Buscar el último score de Expert Recruiter
    const expertStep = steps.find(step => step.agent.id === 'expert-recruiter');
    if (expertStep?.score) {
      return expertStep.score;
    }

    // Fallback al score del análisis inicial
    if (analysisResult?.overallScore) {
      return analysisResult.overallScore;
    }

    // Calcular promedio de scores disponibles
    const scores = steps.filter(step => step.score).map(step => step.score!);
    if (scores.length > 0) {
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    return 0;
  }

  private extractImprovements(steps: PipelineStep[]): string[] {
    const improvements: string[] = [];
    
    steps.forEach(step => {
      if (step.agent.id === 'content-enhancer') {
        improvements.push('Contenido reescrito y optimizado');
      }
      if (step.agent.id === 'industry-recruiter') {
        improvements.push('Optimización específica de industria aplicada');
      }
      if (step.agent.id === 'position-enhancer') {
        improvements.push('CV alineado al puesto específico');
      }
      if (step.agent.id === 'head-hunter') {
        improvements.push('Refinamiento ejecutivo aplicado');
      }
      if (step.agent.id === 'humanizer') {
        improvements.push('Formato final y humanización completada');
      }
    });

    return improvements;
  }

  private generateChangesExplanation(steps: PipelineStep[]): string {
    const changes = steps.map(step => {
      switch (step.agent.id) {
        case 'content-enhancer':
          return 'Reescribimos y reorganizamos el contenido para mayor impacto profesional';
        case 'industry-recruiter':
          return 'Aplicamos optimización específica para tu industria con terminología sectorial';
        case 'position-enhancer':
          return 'Alineamos tu CV específicamente al puesto objetivo';
        case 'expert-recruiter':
          return 'Validamos con criterios rigurosos de reclutador senior';
        case 'head-hunter':
          return 'Refinamos a estándares ejecutivos premium';
        case 'humanizer':
          return 'Aplicamos formato final y verificaciones de calidad';
        default:
          return `Procesamiento completado por ${step.agent.name}`;
      }
    });

    return changes.join('. ');
  }
}

// Factory function para crear pipeline
export function createAIPipeline(onProgress?: (progress: PipelineProgress) => void): AIPipeline {
  return new AIPipeline(onProgress);
}