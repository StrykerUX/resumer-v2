// Sistema de Checkpoints Automáticos para Control de Calidad

import { CheckpointResult } from '@/types/ai-pipeline';
import { CVScoringSystem } from './scoring-system';

export interface CheckpointConfig {
  minScore: number;
  maxRetries: number;
  refundOnFailure: boolean;
  notificationRequired: boolean;
}

export interface CheckpointLog {
  timestamp: Date;
  pipelineType: string;
  score: number;
  minRequired: number;
  passed: boolean;
  retryCount: number;
  action: 'passed' | 'retry' | 'refund' | 'escalate';
  userId: string;
  resumeId: string;
}

export class CheckpointSystem {
  private static readonly CHECKPOINT_CONFIGS: Record<string, CheckpointConfig> = {
    simple: {
      minScore: 70,
      maxRetries: 2,
      refundOnFailure: true,
      notificationRequired: false
    },
    advanced: {
      minScore: 78,
      maxRetries: 2,
      refundOnFailure: true,
      notificationRequired: true
    },
    specialized: {
      minScore: 85,
      maxRetries: 2,
      refundOnFailure: true,
      notificationRequired: true
    }
  };

  // Checkpoint principal para validación de calidad
  static async runQualityCheckpoint(
    cvContent: string,
    expertFeedback: any,
    pipelineType: 'simple' | 'advanced' | 'specialized',
    retryCount: number,
    context: {
      userId: string;
      resumeId: string;
      userProfile?: any;
    }
  ): Promise<CheckpointResult> {
    console.log(`🔍 Ejecutando checkpoint de calidad para pipeline ${pipelineType}`);
    
    const config = this.CHECKPOINT_CONFIGS[pipelineType];
    if (!config) {
      throw new Error(`Unknown pipeline type: ${pipelineType}`);
    }

    // Extraer score del feedback del Expert Recruiter
    const score = this.extractScoreFromFeedback(expertFeedback, cvContent);
    
    // Determinar si pasa el checkpoint
    const passed = score >= config.minScore;
    const shouldRetry = !passed && retryCount < config.maxRetries;
    
    // Crear resultado del checkpoint
    const result: CheckpointResult = {
      passed,
      score,
      minRequired: config.minScore,
      shouldRetry,
      retryCount,
      maxRetries: config.maxRetries
    };

    // Log del checkpoint
    await this.logCheckpoint({
      timestamp: new Date(),
      pipelineType,
      score,
      minRequired: config.minScore,
      passed,
      retryCount,
      action: this.determineAction(result, config),
      userId: context.userId,
      resumeId: context.resumeId
    });

    // Acciones específicas según el resultado
    if (passed) {
      console.log(`✅ Checkpoint PASADO - Score: ${score}/${config.minScore}`);
    } else if (shouldRetry) {
      console.log(`🔄 Checkpoint FALLÓ - Reintentando (${retryCount + 1}/${config.maxRetries})`);
    } else {
      console.log(`❌ Checkpoint FALLÓ - Refund automático después de ${retryCount} intentos`);
      
      if (config.refundOnFailure) {
        await this.initiateAutomaticRefund(context.userId, pipelineType, context.resumeId);
      }
      
      if (config.notificationRequired) {
        await this.notifyManualReview(context, score, config.minScore);
      }
    }

    return result;
  }

  // Checkpoint específico para detección de red flags
  static async runRedFlagCheckpoint(
    cvContent: string,
    expertFeedback: any
  ): Promise<{
    hasRedFlags: boolean;
    redFlags: string[];
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }> {
    console.log('🚩 Ejecutando checkpoint de red flags');
    
    const redFlags: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    // Extraer red flags del feedback del Expert Recruiter
    if (expertFeedback?.redFlags && Array.isArray(expertFeedback.redFlags)) {
      redFlags.push(...expertFeedback.redFlags);
    }

    // Detección adicional de red flags
    const additionalFlags = this.detectRedFlags(cvContent);
    redFlags.push(...additionalFlags);

    // Determinar severidad
    if (redFlags.length >= 5) {
      severity = 'high';
    } else if (redFlags.length >= 3) {
      severity = 'medium';
    }

    const hasRedFlags = redFlags.length > 0;
    const recommendation = this.generateRedFlagRecommendation(redFlags, severity);

    console.log(`🚩 Red flags detectadas: ${redFlags.length} (Severidad: ${severity})`);

    return {
      hasRedFlags,
      redFlags: [...new Set(redFlags)], // Eliminar duplicados
      severity,
      recommendation
    };
  }

  // Checkpoint de autenticidad (detección de contenido generado por IA)
  static async runAuthenticityCheckpoint(cvContent: string): Promise<{
    isAuthentic: boolean;
    aiDetectionScore: number;
    suspiciousPatterns: string[];
    humanizationNeeded: boolean;
  }> {
    console.log('🤖 Ejecutando checkpoint de autenticidad');
    
    const suspiciousPatterns = this.detectAIPatterns(cvContent);
    const aiDetectionScore = this.calculateAIDetectionScore(cvContent, suspiciousPatterns);
    
    const isAuthentic = aiDetectionScore < 70; // Umbral de 70%
    const humanizationNeeded = aiDetectionScore > 50;

    console.log(`🤖 Score de detección IA: ${aiDetectionScore}% (Auténtico: ${isAuthentic})`);

    return {
      isAuthentic,
      aiDetectionScore,
      suspiciousPatterns,
      humanizationNeeded
    };
  }

  // Funciones privadas de apoyo

  private static extractScoreFromFeedback(expertFeedback: any, fallbackContent: string): number {
    // Intentar extraer score del feedback del Expert Recruiter
    if (expertFeedback?.overallScore && typeof expertFeedback.overallScore === 'number') {
      return expertFeedback.overallScore;
    }

    // Si no hay score del Expert Recruiter, usar sistema de scoring como fallback
    try {
      const scoringResult = CVScoringSystem.calculateAdvancedScore(fallbackContent);
      return scoringResult.overallScore;
    } catch (error) {
      console.error('Error en fallback scoring:', error);
      return 0;
    }
  }

  private static determineAction(
    result: CheckpointResult,
    config: CheckpointConfig
  ): 'passed' | 'retry' | 'refund' | 'escalate' {
    if (result.passed) return 'passed';
    if (result.shouldRetry) return 'retry';
    if (config.refundOnFailure) return 'refund';
    return 'escalate';
  }

  private static async logCheckpoint(log: CheckpointLog): Promise<void> {
    // En producción, esto se guardaría en base de datos
    console.log('📊 Checkpoint Log:', {
      timestamp: log.timestamp.toISOString(),
      pipelineType: log.pipelineType,
      score: log.score,
      minRequired: log.minRequired,
      passed: log.passed,
      retryCount: log.retryCount,
      action: log.action,
      userId: log.userId.substring(0, 8) + '...',
      resumeId: log.resumeId.substring(0, 8) + '...'
    });
  }

  private static async initiateAutomaticRefund(
    userId: string,
    pipelineType: string,
    resumeId: string
  ): Promise<void> {
    console.log(`💰 Iniciando refund automático para usuario ${userId.substring(0, 8)}...`);
    
    // Aquí se integraría con el sistema de créditos para hacer el refund
    // Por ahora, solo loggeamos la acción
    
    try {
      // En producción, esto haría el refund real en la base de datos
      const refundAmount = this.getRefundAmount(pipelineType);
      
      console.log(`💰 Refund de ${refundAmount} créditos procesado para ${userId.substring(0, 8)}...`);
      
      // También se podría enviar una notificación al usuario
      await this.notifyUserRefund(userId, refundAmount, resumeId);
      
    } catch (error) {
      console.error('❌ Error procesando refund automático:', error);
    }
  }

  private static async notifyManualReview(
    context: { userId: string; resumeId: string },
    score: number,
    minRequired: number
  ): Promise<void> {
    console.log(`📧 Notificando revisión manual para usuario ${context.userId.substring(0, 8)}...`);
    
    // En producción, esto enviaría notificación al equipo de soporte
    const notification = {
      type: 'manual_review_required',
      userId: context.userId,
      resumeId: context.resumeId,
      score,
      minRequired,
      timestamp: new Date().toISOString(),
      message: `CV requiere revisión manual - Score: ${score}/${minRequired}`
    };
    
    console.log('📧 Notificación de revisión manual:', notification);
  }

  private static async notifyUserRefund(
    userId: string,
    amount: number,
    resumeId: string
  ): Promise<void> {
    console.log(`📱 Notificando refund al usuario ${userId.substring(0, 8)}...`);
    
    // En producción, esto enviaría una notificación al usuario
    const userNotification = {
      type: 'automatic_refund',
      userId,
      amount,
      resumeId,
      message: `Tu CV requiere revisión manual. Hemos reembolsado ${amount} créditos a tu cuenta.`,
      timestamp: new Date().toISOString()
    };
    
    console.log('📱 Notificación de refund:', userNotification);
  }

  private static getRefundAmount(pipelineType: string): number {
    const costs = {
      simple: 15,
      advanced: 20,
      specialized: 25
    };
    
    return costs[pipelineType as keyof typeof costs] || 0;
  }

  private static detectRedFlags(cvContent: string): string[] {
    const redFlags: string[] = [];
    const text = cvContent.toLowerCase();
    
    // Red flags comunes
    if (text.length < 200) {
      redFlags.push('CV demasiado corto');
    }
    
    if (text.length > 3000) {
      redFlags.push('CV excesivamente largo');
    }
    
    if (!text.includes('@') && !text.includes('email')) {
      redFlags.push('Información de contacto incompleta');
    }
    
    if (!/\d{4}/.test(cvContent)) {
      redFlags.push('Fechas de experiencia laboral faltantes');
    }
    
    if (text.includes('lorem ipsum')) {
      redFlags.push('Contenido placeholder detectado');
    }
    
    // Patrones sospechosos
    const suspiciousPatterns = [
      /^[a-z\s]+$/i, // Solo letras minúsculas
      /(.)\1{4,}/, // Caracteres repetidos
      /^\s*$/, // Líneas vacías excesivas
    ];
    
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(cvContent)) {
        redFlags.push('Formato sospechoso detectado');
      }
    });
    
    return redFlags;
  }

  private static detectAIPatterns(cvContent: string): string[] {
    const patterns: string[] = [];
    const text = cvContent.toLowerCase();
    
    // Patrones típicos de contenido generado por IA
    const aiPhrases = [
      'como profesional altamente motivado',
      'con experiencia demostrada en',
      'habilidades excepcionales en',
      'passionate professional with',
      'extensive experience in',
      'proven track record of'
    ];
    
    aiPhrases.forEach(phrase => {
      if (text.includes(phrase)) {
        patterns.push(`Frase típica de IA: "${phrase}"`);
      }
    });
    
    // Estructura repetitiva
    const sentences = cvContent.split(/[.!?]+/);
    const startWords = sentences.map(s => s.trim().split(' ')[0]).filter(w => w);
    const repetitions = new Map();
    
    startWords.forEach(word => {
      repetitions.set(word, (repetitions.get(word) || 0) + 1);
    });
    
    for (const [word, count] of repetitions) {
      if (count > 3) {
        patterns.push(`Estructura repetitiva: "${word}" aparece ${count} veces al inicio de oraciones`);
      }
    }
    
    return patterns;
  }

  private static calculateAIDetectionScore(cvContent: string, patterns: string[]): number {
    let score = 0;
    
    // Base score por patrones detectados
    score += patterns.length * 15;
    
    // Análisis de variedad en el lenguaje
    const words = cvContent.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const varietyRatio = uniqueWords.size / words.length;
    
    if (varietyRatio < 0.3) {
      score += 20; // Vocabulario muy repetitivo
    }
    
    // Análisis de estructura de oraciones
    const sentences = cvContent.split(/[.!?]+/);
    const avgWordsPerSentence = words.length / sentences.length;
    
    if (avgWordsPerSentence > 25 || avgWordsPerSentence < 8) {
      score += 15; // Oraciones muy largas o muy cortas (típico de IA)
    }
    
    return Math.min(score, 100);
  }

  private static generateRedFlagRecommendation(redFlags: string[], severity: 'low' | 'medium' | 'high'): string {
    if (redFlags.length === 0) {
      return 'CV sin red flags detectadas. Excelente calidad.';
    }
    
    const recommendations = {
      low: 'Algunas mejoras menores recomendadas para optimizar el CV.',
      medium: 'Varias áreas requieren atención antes de enviar a empleadores.',
      high: 'Múltiples problemas críticos detectados. Se recomienda revisión manual completa.'
    };
    
    return recommendations[severity];
  }
}