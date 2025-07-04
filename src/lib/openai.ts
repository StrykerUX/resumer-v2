import OpenAI from 'openai';

// Solo inicializar OpenAI en el servidor
export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Configuración para análisis de CV
export const CV_ANALYSIS_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  max_tokens: 2000,
};

// Función para analizar CV con IA
export async function analyzeCV(cvText: string, userAnswers?: Record<string, string>) {
  try {
    const openai = getOpenAIClient();
    
    const systemPrompt = `Eres un experto en recursos humanos y optimización de CVs. Tu trabajo es analizar currículums y proporcionar recomendaciones específicas para mejorar las oportunidades de empleo.

INSTRUCCIONES:
1. Analiza el CV de manera integral
2. Identifica fortalezas y áreas de mejora
3. Proporciona recomendaciones específicas y accionables
4. Considera optimización para sistemas ATS
5. Mantén un tono profesional pero amigable
6. Responde en español

FORMATO DE RESPUESTA:
- Puntuación general (1-10)
- 3-5 fortalezas principales
- 3-5 áreas de mejora con recomendaciones específicas
- Consejos para optimización ATS
- Recomendaciones personalizadas basadas en el perfil`;

    const userPrompt = `Analiza este CV:

${cvText}

${userAnswers ? `
Información adicional del usuario:
${Object.entries(userAnswers).map(([key, value]) => `${key}: ${value}`).join('\n')}
` : ''}

Proporciona un análisis detallado y recomendaciones específicas.`;

    const response = await openai.chat.completions.create({
      model: CV_ANALYSIS_CONFIG.model,
      temperature: CV_ANALYSIS_CONFIG.temperature,
      max_tokens: CV_ANALYSIS_CONFIG.max_tokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error analyzing CV:', error);
    throw new Error('Failed to analyze CV');
  }
}

// Función para generar mejora general del CV
export async function generateGeneralImprovement(cvText: string, analysis: string) {
  try {
    const openai = getOpenAIClient();
    
    const systemPrompt = `Eres un experto en mejora de CVs. Tu trabajo es tomar un CV existente y mejorarlo basándote en un análisis previo.

REGLAS IMPORTANTES:
1. NUNCA inventes experiencias, habilidades o educación
2. SOLO mejora la presentación, formato y descripción de información existente
3. Optimiza para sistemas ATS (palabras clave, formato)
4. Mejora la redacción y estructura
5. Mantén toda la información veraz y verificable
6. Responde en español

FORMATO DE RESPUESTA:
- Proporciona el CV mejorado en formato estructurado
- Incluye explicación de cambios realizados`;

    const userPrompt = `CV original:
${cvText}

Análisis previo:
${analysis}

Mejora este CV siguiendo las recomendaciones del análisis, pero manteniendo toda la información veraz.`;

    const response = await openai.chat.completions.create({
      model: CV_ANALYSIS_CONFIG.model,
      temperature: 0.5,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating improvement:', error);
    throw new Error('Failed to generate improvement');
  }
}

// Función para generar mejora específica del CV
export async function generateTargetedImprovement(cvText: string, jobDescription: string, analysis: string) {
  try {
    const openai = getOpenAIClient();
    
    const systemPrompt = `Eres un experto en optimización de CVs para trabajos específicos. Tu trabajo es adaptar un CV existente para una oferta de trabajo específica.

REGLAS IMPORTANTES:
1. NUNCA inventes experiencias, habilidades o educación
2. SOLO reorganiza y enfatiza información existente que sea relevante
3. Optimiza para la descripción de trabajo específica
4. Usa palabras clave de la oferta de trabajo
5. Mantén toda la información veraz y verificable
6. Responde en español

FORMATO DE RESPUESTA:
- Proporciona el CV optimizado para la oferta específica
- Incluye explicación de cambios y estrategia utilizada`;

    const userPrompt = `CV original:
${cvText}

Descripción del trabajo objetivo:
${jobDescription}

Análisis previo:
${analysis}

Adapta este CV para que sea más competitivo para esta oferta específica, manteniendo toda la información veraz.`;

    const response = await openai.chat.completions.create({
      model: CV_ANALYSIS_CONFIG.model,
      temperature: 0.5,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating targeted improvement:', error);
    throw new Error('Failed to generate targeted improvement');
  }
}

// Función unificada para mejoras de CV (nueva)
export async function enhanceCV(
  originalText: string,
  aiAnalysis: string,
  improvements: string[],
  keywords: string[],
  atsOptimization: string[],
  enhancementType: 'general' | 'targeted',
  jobInfo?: {
    title?: string;
    company?: string;
    description?: string;
    requirements?: string[];
  }
) {
  try {
    const openai = getOpenAIClient();
    
    let systemPrompt = '';
    let userPrompt = '';

    if (enhancementType === 'general') {
      systemPrompt = `Eres un experto en optimización de CVs. Tu trabajo es mejorar un CV basándote en un análisis previo de IA y recomendaciones específicas.

REGLAS IMPORTANTES:
1. NUNCA inventes experiencias, habilidades o educación
2. SOLO mejora la presentación, formato y descripción de información existente
3. Aplica las mejoras sugeridas y optimizaciones ATS
4. Integra palabras clave relevantes de manera natural
5. Mejora la redacción y estructura
6. Mantén toda la información veraz y verificable
7. Responde SOLO con el CV mejorado, sin explicaciones adicionales
8. Usa formato profesional y claro
9. Responde en español

ESTRUCTURA RECOMENDADA:
- Información de contacto
- Resumen profesional (2-3 líneas)
- Experiencia laboral (con logros cuantificables)
- Educación
- Habilidades técnicas y blandas
- Certificaciones o logros adicionales (si aplica)`;

      userPrompt = `CV ORIGINAL:
${originalText}

ANÁLISIS DE IA PREVIO:
${aiAnalysis}

MEJORAS SUGERIDAS:
${improvements.join('\n')}

PALABRAS CLAVE A INTEGRAR:
${keywords.join(', ')}

OPTIMIZACIONES ATS:
${atsOptimization.join('\n')}

Mejora este CV aplicando todas las recomendaciones, manteniendo la información veraz y optimizándolo para sistemas ATS.`;

    } else {
      systemPrompt = `Eres un experto en optimización de CVs para trabajos específicos. Tu trabajo es adaptar un CV para una posición específica basándote en análisis previo y información del trabajo objetivo.

REGLAS IMPORTANTES:
1. NUNCA inventes experiencias, habilidades o educación
2. SOLO reorganiza, enfatiza y mejora información existente
3. Optimiza específicamente para el trabajo objetivo
4. Integra palabras clave del trabajo de manera natural
5. Prioriza experiencia y habilidades relevantes para la posición
6. Mantén toda la información veraz y verificable
7. Responde SOLO con el CV optimizado, sin explicaciones adicionales
8. Usa formato profesional y claro
9. Responde en español

ESTRUCTURA RECOMENDADA:
- Información de contacto
- Resumen profesional (enfocado en la posición objetivo)
- Experiencia laboral (priorizando experiencia relevante)
- Habilidades técnicas (enfocadas en los requisitos del trabajo)
- Educación
- Certificaciones relevantes (si aplica)`;

      const jobDescription = jobInfo?.description || '';
      const jobTitle = jobInfo?.title || '';
      const companyName = jobInfo?.company || '';
      const requirements = jobInfo?.requirements || [];

      userPrompt = `CV ORIGINAL:
${originalText}

TRABAJO OBJETIVO:
Puesto: ${jobTitle}
Empresa: ${companyName}
Descripción: ${jobDescription}
Requisitos clave: ${requirements.join(', ')}

ANÁLISIS DE IA PREVIO:
${aiAnalysis}

MEJORAS SUGERIDAS:
${improvements.join('\n')}

PALABRAS CLAVE A INTEGRAR:
${keywords.join(', ')}

OPTIMIZACIONES ATS:
${atsOptimization.join('\n')}

Optimiza este CV específicamente para el trabajo objetivo, aplicando todas las recomendaciones y enfocándote en la experiencia y habilidades más relevantes para la posición.`;
    }

    const response = await openai.chat.completions.create({
      model: CV_ANALYSIS_CONFIG.model,
      temperature: 0.4, // Menor temperatura para mayor consistencia
      max_tokens: 3500, // Más tokens para CVs completos
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    const enhancedContent = response.choices[0]?.message?.content || '';
    
    if (!enhancedContent.trim()) {
      throw new Error('Empty response from OpenAI');
    }

    return enhancedContent;
  } catch (error) {
    console.error('Error enhancing CV:', error);
    throw new Error(`Failed to enhance CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

