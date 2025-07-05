// Sistema Híbrido de Extracción de CVs con OpenAI Vision
// Combina OpenAI GPT-4o-mini para extracción y procesamiento local como fallback

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractionResult {
  success: boolean;
  text: string;
  method: 'openai-vision' | 'local-processing' | 'hybrid';
  wordCount: number;
  confidence: 'high' | 'medium' | 'low';
  metadata: {
    originalSize: number;
    extractedLength: number;
    processingTime: number;
    fallbackUsed: boolean;
  };
}

export class OpenAIVisionExtractor {
  
  // Extracción principal con OpenAI Vision
  static async extractWithOpenAI(
    fileBuffer: Buffer, 
    mimeType: string, 
    fileName: string
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Iniciando extracción con OpenAI Vision...');
      
      // Validar que el archivo sea compatible con Vision
      if (!this.isVisionCompatible(mimeType)) {
        console.log('⚠️ Archivo no compatible con Vision, usando procesamiento local');
        return await this.fallbackToLocalProcessing(fileBuffer, fileName, mimeType);
      }

      // Preparar archivo para OpenAI
      const base64File = fileBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64File}`;

      // Llamada a OpenAI Vision
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Extrae TODO el contenido de texto de este currículum vitae preservando:

ESTRUCTURA CRÍTICA:
- Información personal (nombre, contacto, ubicación)
- Resumen profesional o objetivo
- Experiencia laboral (empresa, puesto, fechas, responsabilidades)
- Educación (institución, título, fechas)
- Habilidades técnicas y blandas
- Certificaciones y logros
- Idiomas y otros datos relevantes

REGLAS DE EXTRACCIÓN:
1. Mantén la jerarquía y organización original
2. Preserva todas las fechas y números exactos
3. No omitas información por irrelevante
4. Respeta el formato de listas y viñetas
5. Incluye TODO el texto visible

Responde ÚNICAMENTE con el texto extraído, sin comentarios adicionales.`
            },
            {
              type: "image_url",
              image_url: { url: dataUrl }
            }
          ]
        }],
        max_tokens: 4000,
        temperature: 0.1 // Baja temperatura para extracción precisa
      });

      const extractedText = response.choices[0].message.content || '';
      
      if (!extractedText || extractedText.trim().length < 100) {
        console.log('⚠️ Extracción OpenAI insuficiente, usando fallback');
        return await this.fallbackToLocalProcessing(fileBuffer, fileName, mimeType);
      }

      const processingTime = Date.now() - startTime;
      const wordCount = extractedText.split(/\s+/).length;

      console.log(`✅ OpenAI Vision exitoso: ${extractedText.length} caracteres, ${wordCount} palabras`);

      return {
        success: true,
        text: extractedText,
        method: 'openai-vision',
        wordCount,
        confidence: this.assessConfidence(extractedText, fileBuffer.length),
        metadata: {
          originalSize: fileBuffer.length,
          extractedLength: extractedText.length,
          processingTime,
          fallbackUsed: false
        }
      };

    } catch (error) {
      console.error('❌ Error en OpenAI Vision:', error);
      console.log('🔄 Usando procesamiento local como fallback...');
      
      return await this.fallbackToLocalProcessing(fileBuffer, fileName, mimeType);
    }
  }

  // Procesamiento híbrido: OpenAI + Local como respaldo
  static async extractHybrid(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ExtractionResult> {
    console.log('🔀 Iniciando extracción híbrida...');

    // Intentar primero con OpenAI Vision
    const openaiResult = await this.extractWithOpenAI(fileBuffer, mimeType, fileName);
    
    if (openaiResult.success && openaiResult.confidence !== 'low') {
      return openaiResult;
    }

    // Si OpenAI falla o tiene baja confianza, usar procesamiento local como respaldo
    console.log('🔄 OpenAI insuficiente, complementando con procesamiento local...');
    const localResult = await this.fallbackToLocalProcessing(fileBuffer, fileName, mimeType);

    // Si ambos tienen contenido, usar el mejor
    if (openaiResult.success && localResult.success) {
      const bestResult = this.selectBestResult(openaiResult, localResult);
      bestResult.method = 'hybrid';
      bestResult.metadata.fallbackUsed = true;
      return bestResult;
    }

    // Retornar el que funcionó
    return openaiResult.success ? openaiResult : localResult;
  }

  // Fallback a procesamiento local
  private static async fallbackToLocalProcessing(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ExtractionResult> {
    const startTime = Date.now();

    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { CVProcessor, validateCVContent, cleanCVText } = await import('./file-processor');
      
      const cvProcessor = new CVProcessor();
      const processedFile = await cvProcessor.processCV(fileBuffer, fileName, mimeType);
      
      const validation = validateCVContent(processedFile);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.error}`);
      }

      const cleanText = cleanCVText(processedFile.text);
      const processingTime = Date.now() - startTime;
      const wordCount = cleanText.split(/\s+/).length;

      console.log(`✅ Procesamiento local exitoso: ${cleanText.length} caracteres`);

      return {
        success: true,
        text: cleanText,
        method: 'local-processing',
        wordCount,
        confidence: this.assessConfidence(cleanText, fileBuffer.length),
        metadata: {
          originalSize: fileBuffer.length,
          extractedLength: cleanText.length,
          processingTime,
          fallbackUsed: true
        }
      };

    } catch (error) {
      console.error('❌ Error en procesamiento local:', error);
      
      return {
        success: false,
        text: '',
        method: 'local-processing',
        wordCount: 0,
        confidence: 'low',
        metadata: {
          originalSize: fileBuffer.length,
          extractedLength: 0,
          processingTime: Date.now() - startTime,
          fallbackUsed: true
        }
      };
    }
  }

  // Verificar compatibilidad con OpenAI Vision
  private static isVisionCompatible(mimeType: string): boolean {
    const compatibleTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    return compatibleTypes.includes(mimeType);
  }

  // Evaluar confianza en la extracción
  private static assessConfidence(text: string, originalSize: number): 'high' | 'medium' | 'low' {
    const textLength = text.length;
    const wordCount = text.split(/\s+/).length;
    
    // Heurísticas para evaluar calidad
    if (textLength < 200 || wordCount < 50) return 'low';
    if (textLength < 1000 || wordCount < 200) return 'medium';
    
    // Verificar presencia de secciones típicas de CV
    const sections = ['experiencia', 'educacion', 'habilidades', 'contacto', 'email', '@'].filter(
      section => text.toLowerCase().includes(section)
    );
    
    if (sections.length >= 4) return 'high';
    if (sections.length >= 2) return 'medium';
    return 'low';
  }

  // Seleccionar el mejor resultado entre OpenAI y local
  private static selectBestResult(
    openaiResult: ExtractionResult,
    localResult: ExtractionResult
  ): ExtractionResult {
    // Preferir OpenAI si tiene alta confianza
    if (openaiResult.confidence === 'high') return openaiResult;
    
    // Preferir el que tenga más contenido útil
    if (localResult.confidence === 'high' && openaiResult.confidence !== 'high') {
      return localResult;
    }
    
    // Por defecto, preferir OpenAI (mejor calidad general)
    return openaiResult.wordCount > localResult.wordCount ? openaiResult : localResult;
  }

  // Función pública para usar en las APIs
  static async extractTextFromFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    preferredMethod: 'openai' | 'local' | 'hybrid' = 'hybrid'
  ): Promise<ExtractionResult> {
    
    switch (preferredMethod) {
      case 'openai':
        return await this.extractWithOpenAI(fileBuffer, mimeType, fileName);
      
      case 'local':
        return await this.fallbackToLocalProcessing(fileBuffer, fileName, mimeType);
      
      case 'hybrid':
      default:
        return await this.extractHybrid(fileBuffer, fileName, mimeType);
    }
  }
}

// Función helper para uso directo
export async function extractCVText(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const result = await OpenAIVisionExtractor.extractTextFromFile(
    fileBuffer, 
    fileName, 
    mimeType, 
    'hybrid'
  );
  
  if (!result.success) {
    throw new Error('Failed to extract text from CV file');
  }
  
  return result.text;
}

export default OpenAIVisionExtractor;