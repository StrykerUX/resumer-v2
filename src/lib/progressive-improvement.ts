// Sistema de Mejora Progresiva Basado en Porcentajes
// Inteligente, adaptativo y realista según el score inicial

export interface ProgressiveImprovementConfig {
  baseImprovementPercentage: number;
  fallbackMinScore: number;
  adaptiveFactors: {
    lowScoreBonus: number;    // Multiplicador para scores < 50
    highScorePenalty: number; // Multiplicador para scores > 80
    mediumScoreNeutral: number; // Multiplicador para scores 50-80
  };
}

export interface ImprovementResult {
  passed: boolean;
  originalScore: number;
  currentScore: number;
  improvementPercentage: number;
  minRequiredImprovement: number;
  adaptedMinImprovement: number;
  fallbackCheck: boolean;
  improvementType: 'percentage' | 'fallback';
  feedback: string;
}

export class ProgressiveImprovementSystem {
  
  private static readonly PIPELINE_CONFIGS: Record<string, ProgressiveImprovementConfig> = {
    simple: {
      baseImprovementPercentage: 5,
      fallbackMinScore: 60,
      adaptiveFactors: {
        lowScoreBonus: 0.7,    // Más fácil para scores bajos
        mediumScoreNeutral: 1.0,
        highScorePenalty: 0.5   // Menos exigente para scores altos
      }
    },
    advanced: {
      baseImprovementPercentage: 8,
      fallbackMinScore: 65,
      adaptiveFactors: {
        lowScoreBonus: 0.75,
        mediumScoreNeutral: 1.0,
        highScorePenalty: 0.6
      }
    },
    specialized: {
      baseImprovementPercentage: 10,
      fallbackMinScore: 70,
      adaptiveFactors: {
        lowScoreBonus: 0.8,
        mediumScoreNeutral: 1.0,
        highScorePenalty: 0.7
      }
    }
  };

  /**
   * Evalúa si la mejora es suficiente usando sistema adaptativo
   */
  static evaluateImprovement(
    originalScore: number,
    currentScore: number,
    pipelineType: 'simple' | 'advanced' | 'specialized'
  ): ImprovementResult {
    const config = this.PIPELINE_CONFIGS[pipelineType];
    
    // Calcular mejora real
    const improvementPercentage = this.calculateImprovementPercentage(originalScore, currentScore);
    
    // Calcular mejora mínima adaptativa
    const adaptedMinImprovement = this.calculateAdaptiveMinImprovement(
      originalScore, 
      config
    );
    
    // Verificar si pasa por porcentaje
    const passesByPercentage = improvementPercentage >= adaptedMinImprovement;
    
    // Verificar fallback (score mínimo absoluto)
    const passesByFallback = currentScore >= config.fallbackMinScore;
    
    // Determinar resultado final
    const passed = passesByPercentage || passesByFallback;
    const improvementType = passesByPercentage ? 'percentage' : 'fallback';
    
    console.log(`📊 Sistema de Mejora Progresiva - ${pipelineType.toUpperCase()}:`, {
      scoreInicial: originalScore,
      scoreActual: currentScore,
      mejoraPorcentaje: `${improvementPercentage.toFixed(1)}%`,
      mejoraRequerida: `${adaptedMinImprovement.toFixed(1)}%`,
      pasaPorMejora: passesByPercentage,
      pasaPorFallback: passesByFallback,
      resultado: passed ? '✅ APROBADO' : '❌ RECHAZADO',
      tipo: improvementType
    });

    return {
      passed,
      originalScore,
      currentScore,
      improvementPercentage,
      minRequiredImprovement: config.baseImprovementPercentage,
      adaptedMinImprovement,
      fallbackCheck: passesByFallback,
      improvementType,
      feedback: this.generateFeedback(
        originalScore, 
        currentScore, 
        improvementPercentage, 
        adaptedMinImprovement, 
        passed,
        improvementType
      )
    };
  }

  /**
   * Calcula el porcentaje de mejora real
   */
  private static calculateImprovementPercentage(
    originalScore: number, 
    currentScore: number
  ): number {
    if (originalScore <= 0) return 0;
    
    const improvement = ((currentScore - originalScore) / originalScore) * 100;
    return Math.max(0, improvement); // No permitir "mejoras" negativas
  }

  /**
   * Calcula la mejora mínima adaptativa según el score inicial
   */
  private static calculateAdaptiveMinImprovement(
    originalScore: number,
    config: ProgressiveImprovementConfig
  ): number {
    const { baseImprovementPercentage, adaptiveFactors } = config;
    
    let adaptiveFactor: number;
    
    // Determinar factor adaptativo según score inicial
    if (originalScore <= 50) {
      // Scores bajos: ser más tolerante (más fácil mejorar)
      adaptiveFactor = adaptiveFactors.lowScoreBonus;
    } else if (originalScore >= 80) {
      // Scores altos: ser menos exigente (difícil mejorar mucho)
      adaptiveFactor = adaptiveFactors.highScorePenalty;
    } else {
      // Scores medios: estándar
      adaptiveFactor = adaptiveFactors.mediumScoreNeutral;
    }
    
    return baseImprovementPercentage * adaptiveFactor;
  }

  /**
   * Genera feedback explicativo para el usuario
   */
  private static generateFeedback(
    originalScore: number,
    currentScore: number,
    improvementPercentage: number,
    requiredImprovement: number,
    passed: boolean,
    improvementType: 'percentage' | 'fallback'
  ): string {
    const improvementPoints = currentScore - originalScore;
    
    if (passed) {
      if (improvementType === 'percentage') {
        return `✅ Mejora exitosa: +${improvementPoints} puntos (${improvementPercentage.toFixed(1)}% mejora vs ${requiredImprovement.toFixed(1)}% requerido)`;
      } else {
        return `✅ Aprobado por score mínimo: ${currentScore} puntos alcanzados`;
      }
    } else {
      return `❌ Mejora insuficiente: +${improvementPoints} puntos (${improvementPercentage.toFixed(1)}% vs ${requiredImprovement.toFixed(1)}% requerido)`;
    }
  }

  /**
   * Obtiene estadísticas de mejora para logging
   */
  static getImprovementStats(
    originalScore: number,
    currentScore: number,
    pipelineType: string
  ): Record<string, any> {
    const improvement = currentScore - originalScore;
    const improvementPercentage = originalScore > 0 ? 
      ((improvement / originalScore) * 100) : 0;
    
    const config = this.PIPELINE_CONFIGS[pipelineType as keyof typeof this.PIPELINE_CONFIGS];
    const requiredImprovement = config ? 
      this.calculateAdaptiveMinImprovement(originalScore, config) : 0;

    return {
      scoreInicial: originalScore,
      scoreFinal: currentScore,
      mejoraPuntos: improvement,
      mejoraPorcentaje: improvementPercentage,
      mejoraRequerida: requiredImprovement,
      categoria: this.categorizeImprovement(originalScore),
      pipelineType
    };
  }

  /**
   * Categoriza el score inicial para analytics
   */
  private static categorizeImprovement(score: number): string {
    if (score <= 50) return 'low-score';
    if (score <= 80) return 'medium-score';
    return 'high-score';
  }

  /**
   * Simula mejoras para testing
   */
  static simulateImprovement(
    originalScore: number,
    pipelineType: 'simple' | 'advanced' | 'specialized'
  ): { minExpected: number; maxExpected: number; targetScore: number } {
    const config = this.PIPELINE_CONFIGS[pipelineType];
    const minImprovement = this.calculateAdaptiveMinImprovement(originalScore, config);
    
    // Calcular rangos esperados
    const minExpectedImprovement = minImprovement;
    const maxExpectedImprovement = minImprovement * 2.5; // Hasta 2.5x la mejora mínima
    
    const minExpectedScore = originalScore + (originalScore * minExpectedImprovement / 100);
    const maxExpectedScore = originalScore + (originalScore * maxExpectedImprovement / 100);
    const targetScore = originalScore + (originalScore * (minExpectedImprovement * 1.5) / 100);
    
    return {
      minExpected: Math.round(minExpectedScore),
      maxExpected: Math.round(Math.min(maxExpectedScore, 100)), // Cap at 100
      targetScore: Math.round(Math.min(targetScore, 100))
    };
  }
}

// Función helper para uso directo
export function evaluateProgressiveImprovement(
  originalScore: number,
  currentScore: number,
  pipelineType: 'simple' | 'advanced' | 'specialized'
): ImprovementResult {
  return ProgressiveImprovementSystem.evaluateImprovement(
    originalScore,
    currentScore,
    pipelineType
  );
}

export default ProgressiveImprovementSystem;