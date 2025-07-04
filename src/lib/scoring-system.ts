// Sistema de Scoring Avanzado para CVs

export interface ScoreBreakdown {
  structure: number;
  content: number;
  keywords: number;
  atsCompatibility: number;
  professionalImpact: number;
}

export interface ScoringWeights {
  structure: number;
  content: number;
  keywords: number;
  atsCompatibility: number;
  professionalImpact: number;
}

export interface ScoringResult {
  overallScore: number;
  categoryScores: ScoreBreakdown;
  improvements: string[];
  strengths: string[];
  grade: 'F' | 'D' | 'C' | 'B' | 'A' | 'A+';
  marketReadiness: 'Low' | 'Medium' | 'High' | 'Excellent';
}

export class CVScoringSystem {
  private static readonly DEFAULT_WEIGHTS: ScoringWeights = {
    structure: 0.20,      // 20%
    content: 0.25,        // 25%
    keywords: 0.20,       // 20%
    atsCompatibility: 0.20, // 20%
    professionalImpact: 0.15 // 15%
  };

  static calculateAdvancedScore(
    cvText: string, 
    userProfile?: { industry?: string; experienceLevel?: string }
  ): ScoringResult {
    const categoryScores = this.calculateCategoryScores(cvText, userProfile);
    const overallScore = this.calculateWeightedScore(categoryScores);
    
    return {
      overallScore,
      categoryScores,
      improvements: this.generateImprovements(categoryScores, cvText),
      strengths: this.identifyStrengths(categoryScores, cvText),
      grade: this.calculateGrade(overallScore),
      marketReadiness: this.assessMarketReadiness(overallScore, categoryScores)
    };
  }

  private static calculateCategoryScores(
    cvText: string, 
    userProfile?: { industry?: string; experienceLevel?: string }
  ): ScoreBreakdown {
    return {
      structure: this.scoreStructure(cvText),
      content: this.scoreContent(cvText, userProfile?.experienceLevel),
      keywords: this.scoreKeywords(cvText, userProfile?.industry),
      atsCompatibility: this.scoreATSCompatibility(cvText),
      professionalImpact: this.scoreProfessionalImpact(cvText)
    };
  }

  private static scoreStructure(cvText: string): number {
    let score = 0;
    const text = cvText.toLowerCase();
    
    // Secciones esenciales (40 puntos)
    const essentialSections = ['experiencia', 'educación', 'habilidades', 'contacto'];
    essentialSections.forEach(section => {
      if (text.includes(section) || text.includes(section.replace('ó', 'o'))) {
        score += 10;
      }
    });
    
    // Información de contacto (20 puntos)
    if (text.includes('@') || text.includes('email')) score += 10;
    if (text.includes('teléfono') || text.includes('telefono') || text.includes('cel')) score += 10;
    
    // Formato y organización (25 puntos)
    if (text.includes('•') || text.includes('-') || text.includes('*')) score += 10; // Viñetas
    if (cvText.split('\n').length > 10) score += 5; // Estructura en párrafos
    if (text.includes('mes') || text.includes('año') || /\d{4}/.test(cvText)) score += 10; // Fechas
    
    // Longitud apropiada (15 puntos)
    const wordCount = cvText.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 1000) score += 15;
    else if (wordCount >= 200 && wordCount <= 1500) score += 10;
    else if (wordCount >= 100 && wordCount <= 2000) score += 5;
    
    return Math.min(score, 100);
  }

  private static scoreContent(cvText: string, experienceLevel?: string): number {
    let score = 0;
    const text = cvText.toLowerCase();
    
    // Logros cuantificables (30 puntos)
    const numbers = cvText.match(/\d+[%$]?/g) || [];
    const percentages = cvText.match(/\d+%/g) || [];
    const currency = cvText.match(/\$[\d,]+/g) || [];
    
    score += Math.min(numbers.length * 3, 15); // Números en general
    score += Math.min(percentages.length * 5, 10); // Porcentajes específicos
    score += Math.min(currency.length * 5, 5); // Cifras monetarias
    
    // Verbos de acción (25 puntos)
    const actionVerbs = [
      'lideré', 'desarrollé', 'implementé', 'creé', 'optimicé', 'gestioné',
      'coordiné', 'dirigí', 'ejecuté', 'mejoré', 'aumenté', 'reduje',
      'led', 'developed', 'implemented', 'created', 'optimized', 'managed'
    ];
    
    let verbCount = 0;
    actionVerbs.forEach(verb => {
      if (text.includes(verb)) verbCount++;
    });
    score += Math.min(verbCount * 3, 25);
    
    // Experiencia relevante según nivel (25 puntos)
    if (experienceLevel === 'entry') {
      if (text.includes('proyecto') || text.includes('práctica') || text.includes('voluntario')) score += 15;
      if (text.includes('curso') || text.includes('certificación')) score += 10;
    } else if (experienceLevel === 'mid') {
      if (text.includes('equipo') || text.includes('colaboración')) score += 10;
      if (text.includes('responsabilidad') || text.includes('logro')) score += 15;
    } else if (experienceLevel === 'senior' || experienceLevel === 'executive') {
      if (text.includes('estrategia') || text.includes('liderazgo')) score += 15;
      if (text.includes('resultados') || text.includes('roi')) score += 10;
    } else {
      score += 15; // Score por defecto
    }
    
    // Coherencia y flujo (20 puntos)
    const sentences = cvText.split(/[.!?]+/);
    if (sentences.length > 10 && sentences.length < 50) score += 10; // Cantidad apropiada
    
    const avgWordsPerSentence = cvText.split(/\s+/).length / sentences.length;
    if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 20) score += 10; // Oraciones bien estructuradas
    
    return Math.min(score, 100);
  }

  private static scoreKeywords(cvText: string, industry?: string): number {
    let score = 0;
    const text = cvText.toLowerCase();
    
    // Keywords generales profesionales (30 puntos)
    const generalKeywords = [
      'liderazgo', 'gestión', 'análisis', 'desarrollo', 'comunicación',
      'teamwork', 'project management', 'problem solving', 'innovation',
      'estrategia', 'planificación', 'colaboración', 'eficiencia'
    ];
    
    generalKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) score += 2;
    });
    
    // Keywords específicos por industria (40 puntos)
    const industryKeywords = this.getIndustryKeywords(industry || 'general');
    industryKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) score += 3;
    });
    
    // Habilidades técnicas (30 puntos)
    const technicalSkills = [
      'excel', 'powerpoint', 'word', 'sql', 'python', 'javascript',
      'adobe', 'salesforce', 'crm', 'erp', 'agile', 'scrum'
    ];
    
    technicalSkills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) score += 2;
    });
    
    return Math.min(score, 100);
  }

  private static scoreATSCompatibility(cvText: string): number {
    let score = 0;
    
    // Formato compatible (30 puntos)
    if (!cvText.includes('│') && !cvText.includes('┃')) score += 10; // Sin caracteres especiales
    if (!/[^\x00-\x7F]/.test(cvText.replace(/[áéíóúñü]/gi, ''))) score += 10; // Caracteres estándar
    if (cvText.length > 500) score += 10; // Contenido suficiente
    
    // Estructura clara (35 puntos)
    const sections = cvText.split(/\n\s*\n/);
    if (sections.length >= 4 && sections.length <= 8) score += 15; // Secciones apropiadas
    
    const hasHeaders = /^[A-Z\s]{3,}$/m.test(cvText);
    if (hasHeaders) score += 10; // Headers claramente identificables
    
    if (cvText.includes('•') || cvText.includes('-')) score += 10; // Listas con viñetas
    
    // Información clave accesible (35 puntos)
    if (cvText.includes('@')) score += 10; // Email visible
    if (/\d{3}/.test(cvText)) score += 10; // Números de teléfono
    if (/\b\d{4}\b/.test(cvText)) score += 15; // Años/fechas
    
    return Math.min(score, 100);
  }

  private static scoreProfessionalImpact(cvText: string): number {
    let score = 0;
    const text = cvText.toLowerCase();
    
    // Lenguaje profesional (25 puntos)
    const professionalTerms = [
      'responsable', 'cargo', 'puesto', 'empresa', 'organización',
      'departamento', 'equipo', 'proyecto', 'objetivo', 'meta'
    ];
    
    professionalTerms.forEach(term => {
      if (text.includes(term)) score += 2;
    });
    
    // Orientación a resultados (35 puntos)
    const resultTerms = [
      'logré', 'alcancé', 'superé', 'mejoré', 'aumenté', 'reduje',
      'optimicé', 'implementé', 'desarrollé', 'creé'
    ];
    
    resultTerms.forEach(term => {
      if (text.includes(term)) score += 3;
    });
    
    // Medidas de impacto (40 puntos)
    if (text.includes('%')) score += 15; // Porcentajes
    if (/aumento|incremento|mejora/.test(text)) score += 10; // Mejoras
    if (/ahorro|reducción|eficiencia/.test(text)) score += 10; // Eficiencias
    if (/premio|reconocimiento|certificación/.test(text)) score += 5; // Reconocimientos
    
    return Math.min(score, 100);
  }

  private static calculateWeightedScore(scores: ScoreBreakdown): number {
    const weights = this.DEFAULT_WEIGHTS;
    
    const weightedScore = 
      scores.structure * weights.structure +
      scores.content * weights.content +
      scores.keywords * weights.keywords +
      scores.atsCompatibility * weights.atsCompatibility +
      scores.professionalImpact * weights.professionalImpact;
    
    return Math.round(weightedScore);
  }

  private static generateImprovements(scores: ScoreBreakdown, cvText: string): string[] {
    const improvements: string[] = [];
    
    if (scores.structure < 70) {
      improvements.push('Mejorar la estructura con secciones claras y información de contacto completa');
    }
    
    if (scores.content < 70) {
      improvements.push('Agregar más logros cuantificables y usar verbos de acción más potentes');
    }
    
    if (scores.keywords < 70) {
      improvements.push('Incluir más palabras clave relevantes para tu industria y puesto objetivo');
    }
    
    if (scores.atsCompatibility < 70) {
      improvements.push('Optimizar formato para compatibilidad con sistemas ATS');
    }
    
    if (scores.professionalImpact < 70) {
      improvements.push('Enfocar más en resultados e impacto profesional medible');
    }
    
    return improvements;
  }

  private static identifyStrengths(scores: ScoreBreakdown, cvText: string): string[] {
    const strengths: string[] = [];
    
    if (scores.structure >= 80) {
      strengths.push('Excelente estructura y organización del CV');
    }
    
    if (scores.content >= 80) {
      strengths.push('Contenido sólido con logros bien documentados');
    }
    
    if (scores.keywords >= 80) {
      strengths.push('Buen uso de palabras clave relevantes');
    }
    
    if (scores.atsCompatibility >= 80) {
      strengths.push('Formato optimizado para sistemas ATS');
    }
    
    if (scores.professionalImpact >= 80) {
      strengths.push('Fuerte orientación a resultados e impacto profesional');
    }
    
    return strengths;
  }

  private static calculateGrade(score: number): 'F' | 'D' | 'C' | 'B' | 'A' | 'A+' {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  private static assessMarketReadiness(score: number, scores: ScoreBreakdown): 'Low' | 'Medium' | 'High' | 'Excellent' {
    if (score >= 90 && Object.values(scores).every(s => s >= 80)) return 'Excellent';
    if (score >= 80) return 'High';
    if (score >= 65) return 'Medium';
    return 'Low';
  }

  private static getIndustryKeywords(industry: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'tecnologia': [
        'desarrollo', 'programación', 'software', 'agile', 'scrum', 'devops',
        'cloud', 'apis', 'frameworks', 'javascript', 'python', 'react'
      ],
      'marketing': [
        'campaña', 'roi', 'analytics', 'social media', 'branding', 'conversión',
        'leads', 'engagement', 'seo', 'sem', 'digital', 'contenido'
      ],
      'finanzas': [
        'análisis financiero', 'presupuesto', 'inversión', 'riesgo', 'compliance',
        'auditoría', 'reporting', 'excel', 'sql', 'modelos financieros'
      ],
      'salud': [
        'paciente', 'diagnóstico', 'tratamiento', 'protocolo', 'regulación',
        'certificación', 'calidad', 'seguridad', 'atención médica'
      ],
      'general': [
        'gestión', 'liderazgo', 'análisis', 'planificación', 'coordinación',
        'comunicación', 'resolución de problemas', 'trabajo en equipo'
      ]
    };
    
    return keywordMap[industry.toLowerCase()] || keywordMap['general'];
  }
}