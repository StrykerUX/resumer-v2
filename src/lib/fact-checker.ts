// Fact Checker Robusto - "El Guardián de la Veracidad"
// Valida que no se haya inventado información comparando con el texto original

import { FactCheckResult } from '@/types/ai-pipeline';

export class FactChecker {
  
  // Verificación principal de veracidad - VERSION CONSERVADORA
  static async verifyContent(originalText: string, enhancedContent: string): Promise<FactCheckResult> {
    const inventedInfo: string[] = [];
    const changesDetected: string[] = [];
    const flaggedSections: string[] = [];
    
    // Análisis más básico - solo detectar invenciones obvias
    
    // 1. Verificar números específicos inventados (solo si son muy específicos)
    const numbersCheck = this.checkSpecificNumbers(originalText, enhancedContent);
    if (numbersCheck.hasViolations) {
      inventedInfo.push(...numbersCheck.violations);
      flaggedSections.push('números específicos');
    }
    
    // 2. Verificar nombres de empresas completamente nuevos
    const experienceCheck = this.checkSpecificCompanies(originalText, enhancedContent);
    if (experienceCheck.hasViolations) {
      inventedInfo.push(...experienceCheck.violations);
      flaggedSections.push('empresas específicas');
    }
    
    // 3. Verificar certificaciones muy específicas inventadas
    const skillsCheck = this.checkSkillsAndCertifications(originalText, enhancedContent);
    if (skillsCheck.hasViolations) {
      inventedInfo.push(...skillsCheck.violations);
      flaggedSections.push('habilidades y certificaciones');
    }
    
    // 4. Verificar instituciones educativas específicas inventadas
    const educationCheck = this.checkSpecificEducation(originalText, enhancedContent);
    if (educationCheck.hasViolations) {
      inventedInfo.push(...educationCheck.violations);
      flaggedSections.push('educación específica');
    }
    
    // 5. Detectar cambios válidos
    const changesAnalysis = this.analyzeValidChanges(originalText, enhancedContent);
    changesDetected.push(...changesAnalysis.validChanges);
    
    // Solo agregar violaciones si son realmente obvias
    if (changesAnalysis.obviousInventions.length > 0) {
      inventedInfo.push(...changesAnalysis.obviousInventions);
      flaggedSections.push('invenciones obvias');
    }
    
    // Calcular score de confianza (más permisivo)
    const confidenceScore = this.calculatePermissiveConfidenceScore(inventedInfo, changesDetected);
    
    // Determinar si está verificado (sin información OBVIAMENTE inventada)
    const isVerified = inventedInfo.length === 0;
    
    const result: FactCheckResult = {
      isVerified,
      originalText,
      enhancedText: enhancedContent,
      inventedInfo,
      changesDetected,
      confidenceScore,
      flaggedSections
    };
    
    // Log para debugging
    console.log('🛡️ Fact Check Result (CONSERVADOR):', {
      isVerified: result.isVerified,
      inventedInfoCount: result.inventedInfo.length,
      changesCount: result.changesDetected.length,
      confidenceScore: result.confidenceScore,
      flaggedSections: result.flaggedSections,
      sampleViolations: result.inventedInfo.slice(0, 3)
    });
    
    return result;
  }
  
  // Verificar números, porcentajes y fechas
  private static checkNumbers(original: string, enhanced: string) {
    const violations: string[] = [];
    
    // Extraer números del contenido mejorado
    const enhancedNumbers = this.extractNumbers(enhanced);
    const originalNumbers = this.extractNumbers(original);
    
    // Verificar cada número del contenido mejorado
    enhancedNumbers.forEach(number => {
      // Buscar contexto del número
      const context = this.getNumberContext(enhanced, number);
      
      // Verificar si el número existe en el original
      const existsInOriginal = originalNumbers.includes(number) || 
                              this.isNumberInContext(original, number, context);
      
      if (!existsInOriginal) {
        violations.push(`Número inventado: ${number} en contexto "${context}"`);
      }
    });
    
    return {
      hasViolations: violations.length > 0,
      violations
    };
  }
  
  // Verificar experiencias laborales
  private static checkWorkExperience(original: string, enhanced: string) {
    const violations: string[] = [];
    
    // Extraer nombres de empresas y puestos
    const enhancedCompanies = this.extractCompanies(enhanced);
    const originalCompanies = this.extractCompanies(original);
    
    const enhancedPositions = this.extractPositions(enhanced);
    const originalPositions = this.extractPositions(original);
    
    // Verificar empresas
    enhancedCompanies.forEach(company => {
      if (!this.isCompanyInOriginal(company, original)) {
        violations.push(`Empresa inventada: ${company}`);
      }
    });
    
    // Verificar puestos
    enhancedPositions.forEach(position => {
      if (!this.isPositionInOriginal(position, original)) {
        violations.push(`Puesto inventado: ${position}`);
      }
    });
    
    return {
      hasViolations: violations.length > 0,
      violations
    };
  }
  
  // Verificar habilidades y certificaciones
  private static checkSkillsAndCertifications(original: string, enhanced: string) {
    const violations: string[] = [];
    
    // Extraer habilidades específicas técnicas (solo habilidades muy específicas)
    const enhancedSkills = this.extractTechnicalSkills(enhanced);
    const originalSkills = this.extractTechnicalSkills(original);
    
    // Verificar certificaciones específicas
    const enhancedCerts = this.extractSpecificCertifications(enhanced);
    const originalCerts = this.extractSpecificCertifications(original);
    
    // Solo verificar habilidades técnicas muy específicas que no estén en el original
    enhancedSkills.forEach(skill => {
      if (skill.length > 15 && !this.isSkillInOriginal(skill, original, originalSkills)) {
        // Solo reportar si es una habilidad muy específica que claramente no estaba
        if (this.isSpecificTechnicalSkill(skill) && !this.hasRelatedSkillInOriginal(skill, original)) {
          violations.push(`Habilidad técnica específica inventada: ${skill}`);
        }
      }
    });
    
    // Solo verificar certificaciones muy específicas
    enhancedCerts.forEach(cert => {
      if (cert.length > 10 && !this.isCertificationInOriginal(cert, original, originalCerts)) {
        violations.push(`Certificación específica inventada: ${cert}`);
      }
    });
    
    return {
      hasViolations: violations.length > 0,
      violations
    };
  }
  
  // Verificar educación
  private static checkEducation(original: string, enhanced: string) {
    const violations: string[] = [];
    
    // Extraer instituciones educativas
    const enhancedInstitutions = this.extractEducationalInstitutions(enhanced);
    const originalInstitutions = this.extractEducationalInstitutions(original);
    
    // Extraer títulos/grados
    const enhancedDegrees = this.extractDegrees(enhanced);
    const originalDegrees = this.extractDegrees(original);
    
    // Verificar instituciones
    enhancedInstitutions.forEach(institution => {
      if (!this.isInstitutionInOriginal(institution, original)) {
        violations.push(`Institución educativa inventada: ${institution}`);
      }
    });
    
    // Verificar títulos
    enhancedDegrees.forEach(degree => {
      if (!this.isDegreeInOriginal(degree, original)) {
        violations.push(`Título/grado inventado: ${degree}`);
      }
    });
    
    return {
      hasViolations: violations.length > 0,
      violations
    };
  }
  
  // Verificar logros específicos
  private static checkAchievements(original: string, enhanced: string) {
    const violations: string[] = [];
    
    // Buscar logros cuantificables específicos
    const enhancedAchievements = this.extractQuantifiableAchievements(enhanced);
    
    enhancedAchievements.forEach(achievement => {
      if (!this.isAchievementInOriginal(achievement, original)) {
        violations.push(`Logro inventado: ${achievement}`);
      }
    });
    
    return {
      hasViolations: violations.length > 0,
      violations
    };
  }
  
  // Analizar cambios válidos vs sospechosos
  private static analyzeChanges(original: string, enhanced: string) {
    const validChanges: string[] = [];
    const suspiciousChanges: string[] = [];
    
    // Detectar mejoras de redacción (válidas)
    if (enhanced.length > original.length * 1.1) {
      validChanges.push('Redacción expandida y mejorada');
    }
    
    // Detectar reorganización (válida)
    const originalSections = this.extractSections(original);
    const enhancedSections = this.extractSections(enhanced);
    
    if (enhancedSections.length !== originalSections.length) {
      validChanges.push('Reorganización de secciones');
    }
    
    // Detectar agregado sospechoso de información específica
    const suspiciousPatterns = [
      /aumentó.+\d+%/gi,
      /redujo.+\d+%/gi,
      /generó.+\$\d+/gi,
      /mejoró.+\d+%/gi,
      /implementó.+que resultó en/gi
    ];
    
    suspiciousPatterns.forEach(pattern => {
      const matches = enhanced.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!original.toLowerCase().includes(match.toLowerCase())) {
            suspiciousChanges.push(`Logro específico sospechoso: ${match}`);
          }
        });
      }
    });
    
    return { validChanges, suspiciousChanges };
  }
  
  // Calcular score de confianza
  private static calculateConfidenceScore(inventedInfo: string[], changesDetected: string[]): number {
    const baseScore = 100;
    const violationPenalty = 20; // -20 por cada violación
    const changeBenefit = 2; // +2 por cada cambio válido
    
    const penalties = inventedInfo.length * violationPenalty;
    const benefits = Math.min(changesDetected.length * changeBenefit, 20); // Max 20 puntos de beneficio
    
    const finalScore = Math.max(0, Math.min(100, baseScore - penalties + benefits));
    
    return Math.round(finalScore);
  }

  // Calcular score de confianza más permisivo
  private static calculatePermissiveConfidenceScore(inventedInfo: string[], changesDetected: string[]): number {
    const baseScore = 100;
    const violationPenalty = 10; // -10 por cada violación (menos estricto)
    const changeBenefit = 5; // +5 por cada cambio válido (más beneficio)
    
    const penalties = inventedInfo.length * violationPenalty;
    const benefits = Math.min(changesDetected.length * changeBenefit, 30); // Max 30 puntos de beneficio
    
    const finalScore = Math.max(0, Math.min(100, baseScore - penalties + benefits));
    
    return Math.round(finalScore);
  }

  // Verificar solo números muy específicos inventados
  private static checkSpecificNumbers(original: string, enhanced: string) {
    const violations: string[] = [];
    
    // Solo buscar números específicos con contexto claro (fechas, salarios, porcentajes altos)
    const specificNumberPatterns = [
      /\$\d+(?:,\d{3})*(?:\.\d{2})?/g, // Salarios específicos
      /\d{4}-\d{4}/g, // Rangos de años
      /(?:aumentó|redujo|mejoró)\s+\d+%/gi, // Mejoras específicas con porcentaje
      /\d+\s+(?:millones?|mil)\s+(?:dólares?|pesos?)/gi // Cantidades específicas grandes
    ];
    
    specificNumberPatterns.forEach(pattern => {
      const enhancedMatches = enhanced.match(pattern) || [];
      enhancedMatches.forEach(match => {
        if (!original.includes(match)) {
          violations.push(`Número específico inventado: ${match}`);
        }
      });
    });
    
    return {
      hasViolations: violations.length > 0,
      violations
    };
  }

  // Verificar solo empresas muy específicas
  private static checkSpecificCompanies(original: string, enhanced: string) {
    const violations: string[] = [];
    
    // Solo buscar nombres de empresas muy específicos (con Inc, Corp, Ltd, etc.)
    const specificCompanyPatterns = [
      /[A-Z][a-zA-Z\s&]+(?:Inc|Corp|Ltd|LLC|S\.A\.|S\.L\.)/g,
      /(?:Microsoft|Google|Apple|Amazon|Facebook|Netflix|Tesla|IBM|Oracle)\s+[A-Z][a-zA-Z\s]+/g
    ];
    
    specificCompanyPatterns.forEach(pattern => {
      const enhancedMatches = enhanced.match(pattern) || [];
      enhancedMatches.forEach(match => {
        if (!original.toLowerCase().includes(match.toLowerCase())) {
          violations.push(`Empresa específica inventada: ${match}`);
        }
      });
    });
    
    return {
      hasViolations: violations.length > 0,
      violations
    };
  }

  // Verificar solo educación muy específica
  private static checkSpecificEducation(original: string, enhanced: string) {
    const violations: string[] = [];
    
    // Solo buscar instituciones educativas muy específicas
    const specificEducationPatterns = [
      /(?:Universidad|Instituto|Colegio)\s+[A-Z][a-zA-Z\s]+(?:de|del|Nacional|Autónoma)/g,
      /(?:Harvard|MIT|Stanford|Yale|Oxford|Cambridge)\s+[A-Z][a-zA-Z\s]*/g
    ];
    
    specificEducationPatterns.forEach(pattern => {
      const enhancedMatches = enhanced.match(pattern) || [];
      enhancedMatches.forEach(match => {
        if (!original.toLowerCase().includes(match.toLowerCase())) {
          violations.push(`Institución educativa específica inventada: ${match}`);
        }
      });
    });
    
    return {
      hasViolations: violations.length > 0,
      violations
    };
  }

  // Analizar cambios válidos vs invenciones obvias
  private static analyzeValidChanges(original: string, enhanced: string) {
    const validChanges: string[] = [];
    const obviousInventions: string[] = [];
    
    // Detectar mejoras de redacción (válidas)
    if (enhanced.length > original.length * 1.1) {
      validChanges.push('Redacción expandida y mejorada');
    }
    
    // Detectar reorganización (válida)
    if (enhanced.includes('•') && !original.includes('•')) {
      validChanges.push('Formato mejorado con viñetas');
    }
    
    // Solo detectar invenciones MUY obvias
    const obviousInventionPatterns = [
      /desarrollé\s+(?:un\s+sistema|una\s+aplicación)\s+que\s+[^.]{50,}/gi, // Proyectos específicos muy detallados
      /lideré\s+un\s+equipo\s+de\s+\d+\s+personas\s+en\s+[^.]{30,}/gi, // Liderazgo muy específico
      /obtuve\s+una\s+certificación\s+en\s+[A-Z][^.]{20,}/gi // Certificaciones específicas inventadas
    ];
    
    obviousInventionPatterns.forEach(pattern => {
      const matches = enhanced.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Solo considerar invención si no hay palabras relacionadas en el original
          const words = match.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const foundWords = words.filter(word => 
            original.toLowerCase().includes(word)
          );
          
          if (foundWords.length < words.length * 0.3) {
            obviousInventions.push(`Posible invención: ${match.substring(0, 50)}...`);
          }
        });
      }
    });
    
    return { validChanges, obviousInventions };
  }
  
  // Funciones auxiliares de extracción
  private static extractNumbers(text: string): string[] {
    const numberRegex = /\b\d+(?:\.\d+)?%?\b/g;
    return text.match(numberRegex) || [];
  }
  
  private static getNumberContext(text: string, number: string): string {
    const index = text.indexOf(number);
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + number.length + 30);
    return text.substring(start, end);
  }
  
  private static isNumberInContext(original: string, number: string, context: string): boolean {
    // Buscar el número en contexto similar en el original
    const words = context.split(/\s+/).filter(w => w !== number);
    const contextWords = words.slice(0, 3); // Primeras 3 palabras del contexto
    
    return contextWords.some(word => 
      original.toLowerCase().includes(word.toLowerCase()) &&
      original.includes(number)
    );
  }
  
  private static extractCompanies(text: string): string[] {
    // Buscar patrones de empresas (simplificado)
    const companyPatterns = [
      /en\s+([A-Z][a-zA-Z\s&]+(?:Inc|Ltd|Corp|SA|SL|S\.A\.|S\.L\.))/g,
      /empresa\s+([A-Z][a-zA-Z\s&]+)/g,
      /compañía\s+([A-Z][a-zA-Z\s&]+)/g
    ];
    
    const companies: string[] = [];
    companyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const company = match.split(/\s+/).slice(1).join(' ');
          companies.push(company);
        });
      }
    });
    
    return companies;
  }
  
  private static extractPositions(text: string): string[] {
    // Buscar títulos de puestos (simplificado)
    const positionPatterns = [
      /(?:como|puesto de|cargo de)\s+([A-Z][a-zA-Z\s]+)/g,
      /(?:desarrollador|ingeniero|gerente|director|analista|especialista)\s+([a-zA-Z\s]+)/gi
    ];
    
    const positions: string[] = [];
    positionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        positions.push(...matches);
      }
    });
    
    return positions;
  }
  
  private static extractSkills(text: string): string[] {
    // Extraer habilidades técnicas (simplificado)
    const skillPatterns = [
      /(?:JavaScript|Python|Java|React|Angular|Vue|Node\.js|TypeScript|SQL|MySQL|PostgreSQL|MongoDB|Docker|Kubernetes|AWS|Azure|GCP)/gi
    ];
    
    const skills: string[] = [];
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        skills.push(...matches);
      }
    });
    
    return skills;
  }

  // Nueva función para extraer solo habilidades técnicas muy específicas
  private static extractTechnicalSkills(text: string): string[] {
    const specificTechPatterns = [
      /(?:JavaScript|Python|Java|React|Angular|Vue|Node\.js|TypeScript|SQL|MySQL|PostgreSQL|MongoDB|Docker|Kubernetes|AWS|Azure|GCP)/gi,
      // Solo tecnologías muy específicas con versiones
      /(?:Python\s+\d+\.\d+|Node\.js\s+\d+|React\s+\d+)/gi
    ];
    
    const skills: string[] = [];
    specificTechPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        skills.push(...matches);
      }
    });
    
    return skills;
  }

  // Nueva función para extraer certificaciones específicas
  private static extractSpecificCertifications(text: string): string[] {
    const specificCertPatterns = [
      /(?:AWS\s+(?:Solutions\s+Architect|Developer|SysOps))/gi,
      /(?:Microsoft\s+(?:Azure\s+\w+|Office\s+Specialist))/gi,
      /(?:Google\s+(?:Cloud\s+\w+|Analytics))/gi,
      /(?:Oracle\s+(?:Database\s+\w+|Java\s+\w+))/gi
    ];
    
    const certifications: string[] = [];
    specificCertPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        certifications.push(...matches);
      }
    });
    
    return certifications;
  }

  // Verificar si es una habilidad técnica muy específica
  private static isSpecificTechnicalSkill(skill: string): boolean {
    const specificTechSkills = [
      'kubernetes', 'docker', 'tensorflow', 'pytorch', 'elasticsearch',
      'microservices', 'serverless', 'graphql', 'blockchain'
    ];
    
    return specificTechSkills.some(tech => 
      skill.toLowerCase().includes(tech.toLowerCase())
    );
  }

  // Verificar si hay habilidad relacionada en el original
  private static hasRelatedSkillInOriginal(skill: string, original: string): boolean {
    const words = skill.toLowerCase().split(/\s+/);
    const keyWords = words.filter(word => word.length > 3);
    
    // Si al menos 30% de las palabras clave están en el original, considerar relacionada
    const foundWords = keyWords.filter(word => 
      original.toLowerCase().includes(word)
    );
    
    return foundWords.length >= keyWords.length * 0.3;
  }
  
  private static extractCertifications(text: string): string[] {
    // Extraer certificaciones
    const certPatterns = [
      /(?:certificación|certificado|certification)\s+([A-Z][a-zA-Z\s]+)/gi,
      /(?:AWS|Azure|Google|Microsoft|Oracle)\s+([A-Z][a-zA-Z\s]+)(?:certification|certified)/gi
    ];
    
    const certifications: string[] = [];
    certPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        certifications.push(...matches);
      }
    });
    
    return certifications;
  }
  
  private static extractEducationalInstitutions(text: string): string[] {
    // Extraer instituciones educativas
    const institutionPatterns = [
      /(?:universidad|instituto|colegio|escuela)\s+([A-Z][a-zA-Z\s]+)/gi,
      /(?:en|de)\s+([A-Z][a-zA-Z\s]+(?:Universidad|Instituto|Colegio|Escuela))/gi
    ];
    
    const institutions: string[] = [];
    institutionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        institutions.push(...matches);
      }
    });
    
    return institutions;
  }
  
  private static extractDegrees(text: string): string[] {
    // Extraer títulos/grados
    const degreePatterns = [
      /(?:licenciatura|maestría|doctorado|ingeniería|carrera)\s+en\s+([a-zA-Z\s]+)/gi,
      /(?:bachelor|master|phd|degree)\s+(?:in|of)\s+([a-zA-Z\s]+)/gi
    ];
    
    const degrees: string[] = [];
    degreePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        degrees.push(...matches);
      }
    });
    
    return degrees;
  }
  
  private static extractQuantifiableAchievements(text: string): string[] {
    // Extraer logros específicos con números
    const achievementPatterns = [
      /(?:aumentó|redujo|mejoró|implementó|desarrolló|creó|generó).+\d+(?:%|\$|usuarios|clientes|ventas)/gi,
      /(?:responsable|encargado).+\d+(?:personas|empleados|equipos)/gi,
      /(?:manejó|gestionó).+\$?\d+(?:millones?|k|mil)/gi
    ];
    
    const achievements: string[] = [];
    achievementPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        achievements.push(...matches);
      }
    });
    
    return achievements;
  }
  
  private static extractSections(text: string): string[] {
    const sectionPatterns = [
      /(?:experiencia|education|habilidades|skills|certificaciones|logros)/gi
    ];
    
    const sections: string[] = [];
    sectionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        sections.push(...matches);
      }
    });
    
    return sections;
  }
  
  // Funciones de verificación
  private static isCompanyInOriginal(company: string, original: string): boolean {
    return original.toLowerCase().includes(company.toLowerCase());
  }
  
  private static isPositionInOriginal(position: string, original: string): boolean {
    return original.toLowerCase().includes(position.toLowerCase());
  }
  
  private static isSkillInOriginal(skill: string, original: string, originalSkills: string[]): boolean {
    return originalSkills.some(originalSkill => 
      originalSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(originalSkill.toLowerCase())
    ) || original.toLowerCase().includes(skill.toLowerCase());
  }
  
  private static isCertificationInOriginal(cert: string, original: string, originalCerts: string[]): boolean {
    return originalCerts.some(originalCert => 
      originalCert.toLowerCase().includes(cert.toLowerCase())
    ) || original.toLowerCase().includes(cert.toLowerCase());
  }
  
  private static isInstitutionInOriginal(institution: string, original: string): boolean {
    return original.toLowerCase().includes(institution.toLowerCase());
  }
  
  private static isDegreeInOriginal(degree: string, original: string): boolean {
    return original.toLowerCase().includes(degree.toLowerCase());
  }
  
  private static isAchievementInOriginal(achievement: string, original: string): boolean {
    // Verificar si el logro específico tiene base en el original
    const words = achievement.toLowerCase().split(/\s+/);
    const keyWords = words.filter(word => word.length > 3); // Palabras significativas
    
    // Al menos 50% de palabras clave deben estar en el original
    const foundWords = keyWords.filter(word => 
      original.toLowerCase().includes(word)
    );
    
    return foundWords.length >= keyWords.length * 0.5;
  }
}