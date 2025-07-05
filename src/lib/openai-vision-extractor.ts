// Sistema Híbrido de Extracción de CVs con OpenAI Vision
// Combina OpenAI GPT-4o-mini para extracción y procesamiento local como fallback

import OpenAI from 'openai';
import { PDFToImageConverter } from './pdf-to-image';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractionResult {
  success: boolean;
  text: string;
  method: 'openai-vision' | 'openai-vision-pdf' | 'local-processing' | 'hybrid';
  wordCount: number;
  confidence: 'high' | 'medium' | 'low';
  metadata: {
    originalSize: number;
    extractedLength: number;
    processingTime: number;
    fallbackUsed: boolean;
    pdfConverted?: boolean;
    pagesProcessed?: number;
    conversionTime?: number;
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

  // Extracción de PDF usando conversión a imagen + OpenAI Vision
  static async extractFromPDF(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      console.log('📄 Iniciando extracción PDF→Imagen→OpenAI Vision...');

      // Verificar que sea un PDF y que valga la pena convertir
      if (mimeType !== 'application/pdf') {
        throw new Error('No es un archivo PDF');
      }

      if (!PDFToImageConverter.shouldConvertPDF(mimeType, fileBuffer.length)) {
        console.log('⚠️ PDF no apto para conversión, usando fallback local');
        return await this.fallbackToLocalProcessing(fileBuffer, fileName, mimeType);
      }

      // Convertir PDF a imágenes optimizadas
      const conversionResult = await PDFToImageConverter.convertPDFToImages(
        fileBuffer,
        fileName,
        {
          maxPages: 3,        // Máximo 3 páginas
          density: 150,       // Buena calidad
          format: 'png',      // PNG para mejor calidad de texto
          maxWidth: 2048,     // Límite OpenAI Vision
          maxHeight: 2048     // Límite OpenAI Vision
        }
      );

      if (!conversionResult.success || conversionResult.images.length === 0) {
        console.log('❌ Conversión PDF→Imagen falló, usando fallback local');
        return await this.fallbackToLocalProcessing(fileBuffer, fileName, mimeType);
      }

      console.log(`✅ PDF convertido: ${conversionResult.pageCount} página(s)`);

      // Crear data URLs para OpenAI
      const dataUrls = PDFToImageConverter.createDataURLsFromImages(
        conversionResult.images,
        'png'
      );

      // Procesar cada página con OpenAI Vision
      let combinedText = '';
      let totalTokensUsed = 0;

      for (let i = 0; i < dataUrls.length; i++) {
        console.log(`🤖 Procesando página ${i + 1}/${dataUrls.length} con OpenAI Vision...`);

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: `Extrae TODO el contenido de texto de esta página de currículum vitae (página ${i + 1}). Preserva:

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
6. Si es página ${i + 1} de ${dataUrls.length}, indica claramente el contenido

Responde ÚNICAMENTE con el texto extraído, sin comentarios adicionales.`
              },
              {
                type: "image_url",
                image_url: { url: dataUrls[i] }
              }
            ]
          }],
          max_tokens: 4000,
          temperature: 0.1
        });

        const pageText = response.choices[0].message.content || '';
        
        if (pageText && pageText.trim().length > 20) {
          combinedText += (i > 0 ? '\n\n--- PÁGINA ' + (i + 1) + ' ---\n\n' : '') + pageText;
          totalTokensUsed += response.usage?.total_tokens || 0;
          console.log(`✅ Página ${i + 1} procesada: ${pageText.length} caracteres`);
        } else {
          console.warn(`⚠️ Página ${i + 1} con poco contenido, saltando...`);
        }
      }

      if (!combinedText || combinedText.trim().length < 100) {
        console.log('⚠️ Extracción OpenAI PDF insuficiente, usando fallback local');
        return await this.fallbackToLocalProcessing(fileBuffer, fileName, mimeType);
      }

      const processingTime = Date.now() - startTime;
      const wordCount = combinedText.split(/\s+/).length;

      console.log(`✅ Extracción PDF→OpenAI Vision exitosa:`, {
        páginas: conversionResult.pageCount,
        caracteres: combinedText.length,
        palabras: wordCount,
        tokensUsados: totalTokensUsed,
        tiempo: `${processingTime}ms`
      });

      return {
        success: true,
        text: combinedText,
        method: 'openai-vision-pdf',
        wordCount,
        confidence: this.assessConfidence(combinedText, fileBuffer.length),
        metadata: {
          originalSize: fileBuffer.length,
          extractedLength: combinedText.length,
          processingTime,
          fallbackUsed: false,
          pdfConverted: true,
          pagesProcessed: conversionResult.pageCount,
          conversionTime: conversionResult.processingTime
        }
      };

    } catch (error) {
      console.error('❌ Error en extracción PDF→OpenAI Vision:', error);
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

    let openaiResult: ExtractionResult;

    // Decidir método OpenAI según tipo de archivo
    if (mimeType === 'application/pdf') {
      // Para PDFs: usar conversión a imagen + OpenAI Vision
      console.log('📄 Detectado PDF, usando conversión PDF→Imagen→OpenAI Vision...');
      openaiResult = await this.extractFromPDF(fileBuffer, fileName, mimeType);
    } else if (this.isVisionCompatible(mimeType)) {
      // Para imágenes: usar OpenAI Vision directo
      console.log('🖼️ Detectado imagen, usando OpenAI Vision directo...');
      openaiResult = await this.extractWithOpenAI(fileBuffer, mimeType, fileName);
    } else {
      // Para otros formatos: saltar directo a local
      console.log('📄 Formato no compatible con OpenAI Vision, usando procesamiento local...');
      return await this.fallbackToLocalProcessing(fileBuffer, fileName, mimeType);
    }
    
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

  // Fallback a procesamiento local optimizado
  private static async fallbackToLocalProcessing(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ExtractionResult> {
    const startTime = Date.now();

    try {
      console.log('🔧 Iniciando procesamiento local optimizado...');
      
      // Importar dinámicamente para evitar dependencias circulares
      const { CVProcessor, validateCVContent, advancedCleanCVText } = await import('./file-processor');
      
      const cvProcessor = new CVProcessor();
      const processedFile = await cvProcessor.processCV(fileBuffer, fileName, mimeType);
      
      console.log(`📄 Texto extraído localmente: ${processedFile.text.length} caracteres`);
      
      // Usar limpieza avanzada optimizada
      const cleaningResult = advancedCleanCVText(processedFile.text);
      const { cleanedText, qualityAssessment } = cleaningResult;
      
      // Validar contenido limpio
      const mockProcessedFile = {
        ...processedFile,
        text: cleanedText,
        metadata: {
          ...processedFile.metadata,
          wordCount: cleanedText.split(/\s+/).length
        }
      };
      
      const validation = validateCVContent(mockProcessedFile);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.error}`);
      }

      const processingTime = Date.now() - startTime;
      const wordCount = cleanedText.split(/\s+/).length;

      // Determinar confianza basada en calidad del texto
      let confidence: 'high' | 'medium' | 'low';
      if (qualityAssessment.confidence === 'high' && qualityAssessment.score >= 80) {
        confidence = 'high';
      } else if (qualityAssessment.confidence === 'medium' && qualityAssessment.score >= 60) {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }

      console.log(`✅ Procesamiento local optimizado exitoso:`, {
        caracteres: cleanedText.length,
        palabras: wordCount,
        calidadScore: qualityAssessment.score,
        confianza: confidence,
        problemas: qualityAssessment.issues.length,
        tiempo: `${processingTime}ms`
      });

      return {
        success: true,
        text: cleanedText,
        method: 'local-processing',
        wordCount,
        confidence,
        metadata: {
          originalSize: fileBuffer.length,
          extractedLength: cleanedText.length,
          processingTime,
          fallbackUsed: true
        }
      };

    } catch (error) {
      console.error('❌ Error en procesamiento local optimizado:', error);
      
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

  // Verificar compatibilidad con OpenAI Vision directo (sin conversión)
  private static isVisionCompatible(mimeType: string): boolean {
    const compatibleTypes = [
      // PDFs excluidos - se manejan con conversión separada
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
    // Preferir OpenAI PDF conversion si tiene alta confianza (método más sofisticado)
    if (openaiResult.method === 'openai-vision-pdf' && openaiResult.confidence === 'high') {
      return openaiResult;
    }
    
    // Preferir OpenAI directo si tiene alta confianza
    if (openaiResult.method === 'openai-vision' && openaiResult.confidence === 'high') {
      return openaiResult;
    }
    
    // Preferir el que tenga más contenido útil
    if (localResult.confidence === 'high' && openaiResult.confidence !== 'high') {
      return localResult;
    }
    
    // Preferir métodos OpenAI en general (mejor calidad)
    if (openaiResult.method.startsWith('openai-vision') && openaiResult.wordCount > 0) {
      return openaiResult;
    }
    
    // Por defecto, usar el que tenga más palabras
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