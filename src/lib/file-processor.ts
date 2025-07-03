import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import { fromBuffer } from 'pdf2pic';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

export interface ProcessedFile {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    pageCount?: number;
    wordCount: number;
    processingMethod: 'pdf-lib' | 'ocr' | 'mammoth';
    confidence?: number;
  };
}

/**
 * Valida si el texto extraído tiene contenido útil de CV
 */
export function hasUsefulContent(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }
  
  const keywords = [
    'experience', 'education', 'skills', 'email', '@',
    'experiencia', 'educación', 'habilidades', 'trabajo',
    'universidad', 'carrera', 'profesional', 'contacto'
  ];
  
  const wordCount = text.split(/\s+/).length;
  const lowercaseText = text.toLowerCase();
  const hasKeywords = keywords.some(keyword => lowercaseText.includes(keyword));
  
  return wordCount > 50 && hasKeywords;
}

/**
 * Extrae texto de PDF usando detección rápida (intenta usar características simples del PDF)
 */
export async function extractTextWithQuickMethod(buffer: Buffer, fileName: string): Promise<ProcessedFile> {
  try {
    console.log('🚀 Intentando extracción rápida con detección simple:', fileName);
    
    // Convertir buffer a string para buscar texto básico
    const pdfString = buffer.toString('latin1');
    
    // Buscar patrones de texto comunes en PDFs
    const textMatches = pdfString.match(/\((.*?)\)/g);
    let extractedText = '';
    
    if (textMatches && textMatches.length > 0) {
      extractedText = textMatches
        .map(match => match.slice(1, -1)) // Remover paréntesis
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text)) // Filtrar texto real
        .join(' ')
        .slice(0, 5000); // Limitar para evitar texto excesivo
    }
    
    // Si no encontramos suficiente texto, fallar para usar OCR
    if (extractedText.length < 100) {
      throw new Error('Quick method could not extract sufficient text');
    }
    
    console.log('✅ Extracción rápida exitosa');
    
    return {
      text: extractedText,
      metadata: {
        fileName,
        fileType: 'pdf',
        fileSize: buffer.length,
        wordCount: extractedText.split(/\s+/).length,
        processingMethod: 'pdf-lib', // Keep same for consistency
        confidence: 0.7 // Lower confidence for this simple method
      }
    };
  } catch (error) {
    console.log('❌ Extracción rápida falló:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Preprocessa imagen para mejorar precisión OCR
 */
export async function preprocessImageForOCR(imageBuffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .greyscale()
      .normalize()
      .sharpen()
      .threshold(128)
      .toBuffer();
  } catch (error) {
    console.warn('⚠️ Preprocessing falló, usando imagen original:', error);
    return imageBuffer;
  }
}

/**
 * Extrae texto usando OCR (para PDFs escaneados e imágenes)
 */
export async function extractTextWithOCR(buffer: Buffer, fileName: string, isImage: boolean = false): Promise<ProcessedFile> {
  try {
    console.log('🔍 Iniciando extracción OCR:', fileName);
    
    let images: { buffer: Buffer }[] = [];
    
    if (isImage) {
      // Es una imagen directa
      const processedImage = await preprocessImageForOCR(buffer);
      images = [{ buffer: processedImage }];
    } else {
      // Es un PDF, convertir a imágenes
      console.log('📄 Convirtiendo PDF a imágenes...');
      const convert = fromBuffer(buffer, {
        density: 300,
        format: 'png',
        width: 2480,
        height: 3508
      });
      
      const pages = await convert.bulk(-1, { responseType: 'buffer' });
      images = pages.map(page => ({ buffer: page.buffer as Buffer }));
    }
    
    console.log(`📸 Procesando ${images.length} imagen(es) con OCR...`);
    
    const worker = await createWorker({
      logger: m => console.log('Tesseract:', m.status, m.progress),
    });
    
    try {
      await worker.loadLanguage('eng+spa');
      await worker.initialize('eng+spa');
      
      let fullText = '';
      
      for (let i = 0; i < images.length; i++) {
        console.log(`🔍 Procesando página ${i + 1}/${images.length}...`);
        const processedImage = await preprocessImageForOCR(images[i].buffer);
        const { data: { text, confidence } } = await worker.recognize(processedImage);
        fullText += text + '\n';
        console.log(`✅ Página ${i + 1} procesada - Confianza: ${confidence}%`);
      }
      
      await worker.terminate();
      
      if (!fullText || fullText.trim().length === 0) {
        throw new Error('No se pudo extraer texto con OCR');
      }
      
      console.log('✅ OCR completado exitosamente');
      
      return {
        text: fullText,
        metadata: {
          fileName,
          fileType: isImage ? 'image' : 'pdf',
          fileSize: buffer.length,
          pageCount: images.length,
          wordCount: fullText.split(/\s+/).length,
          processingMethod: 'ocr',
          confidence: 0.8
        }
      };
    } finally {
      await worker.terminate();
    }
  } catch (error) {
    console.error('❌ Error en OCR:', error);
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Procesa un archivo PDF usando estrategia híbrida (PDF-Lib primero, OCR como fallback)
 */
export async function processPDF(buffer: Buffer, fileName: string): Promise<ProcessedFile> {
  try {
    console.log('📄 Iniciando procesamiento híbrido PDF:', fileName);
    
    // Validar que el buffer no esté vacío
    if (!buffer || buffer.length === 0) {
      throw new Error('PDF buffer is empty');
    }
    
    // Validar que sea un PDF válido
    const pdfHeader = buffer.subarray(0, 4).toString();
    if (pdfHeader !== '%PDF') {
      throw new Error('Invalid PDF file - missing PDF header');
    }
    
    // ESTRATEGIA HÍBRIDA: Intentar extracción rápida primero
    try {
      const result = await extractTextWithQuickMethod(buffer, fileName);
      if (hasUsefulContent(result.text)) {
        console.log('🚀 Extracción rápida exitosa');
        return result;
      }
      console.log('📄 Extracción rápida no produjo contenido útil, usando OCR...');
    } catch (error) {
      console.log('📄 Extracción rápida falló, fallback a OCR:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // FALLBACK: Usar OCR para PDFs escaneados o complejos
    return await extractTextWithOCR(buffer, fileName, false);
    
  } catch (error) {
    console.error('❌ Error procesando PDF:', error);
    throw new Error(`Failed to process PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Procesa un archivo Word (docx) y extrae el texto
 */
export async function processWord(buffer: Buffer, fileName: string): Promise<ProcessedFile> {
  try {
    console.log('📝 Procesando documento Word:', fileName);
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text could be extracted from Word document');
    }
    
    console.log('✅ Word procesado exitosamente');
    
    return {
      text: result.value,
      metadata: {
        fileName,
        fileType: 'docx',
        fileSize: buffer.length,
        wordCount: result.value.split(/\s+/).length,
        processingMethod: 'mammoth',
        confidence: 0.95
      }
    };
  } catch (error) {
    console.error('❌ Error processing Word document:', error);
    throw new Error('Failed to process Word document');
  }
}

/**
 * Procesa una imagen directamente con OCR
 */
export async function processImage(buffer: Buffer, fileName: string): Promise<ProcessedFile> {
  try {
    console.log('🖼️ Procesando imagen:', fileName);
    return await extractTextWithOCR(buffer, fileName, true);
  } catch (error) {
    console.error('❌ Error processing image:', error);
    throw new Error('Failed to process image file');
  }
}

/**
 * Procesa un archivo basado en su tipo usando estrategia híbrida inteligente
 */
export async function processFile(buffer: Buffer, fileName: string, mimeType: string): Promise<ProcessedFile> {
  console.log('📁 Iniciando procesamiento inteligente:', { fileName, mimeType, size: buffer.length });
  
  if (mimeType === 'application/pdf') {
    return processPDF(buffer, fileName);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return processWord(buffer, fileName);
  } else if (mimeType.startsWith('image/')) {
    return processImage(buffer, fileName);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}. Supported types: PDF, Word (.docx), Images`);
  }
}

/**
 * Valida que el archivo tenga contenido suficiente para análisis
 */
export function validateCVContent(processedFile: ProcessedFile): { valid: boolean; error?: string } {
  const { text, metadata } = processedFile;
  
  // Verificar que el archivo no esté vacío
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'El archivo parece estar vacío' };
  }
  
  // Verificar cantidad mínima de palabras
  if (metadata.wordCount < 50) {
    return { valid: false, error: 'El CV debe tener al menos 50 palabras' };
  }
  
  // Usar la función hasUsefulContent para validación
  if (!hasUsefulContent(text)) {
    return { valid: false, error: 'El archivo no parece contener información de CV' };
  }
  
  // Verificar confianza del método de procesamiento
  if (metadata.confidence && metadata.confidence < 0.3) {
    return { valid: false, error: 'La calidad del texto extraído es muy baja. Intenta con un archivo de mejor calidad.' };
  }
  
  return { valid: true };
}

/**
 * Limpia y normaliza el texto extraído
 */
export function cleanCVText(text: string): string {
  return text
    // Remover caracteres especiales y saltos de línea excesivos
    .replace(/[\r\n]+/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
    // Remover caracteres no imprimibles (OCR puede generar basura)
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, '')
    // Normalizar espacios
    .replace(/\s{2,}/g, ' ')
    // Limpiar artefactos comunes de OCR
    .replace(/[|\\/_]+/g, ' ')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '\u2022') // Normalizar bullets
    .trim();
}

/**
 * Obtiene información del método de procesamiento usado
 */
export function getProcessingInfo(processedFile: ProcessedFile): string {
  const { metadata } = processedFile;
  const method = metadata.processingMethod;
  const confidence = metadata.confidence ? Math.round(metadata.confidence * 100) : 'N/A';
  
  switch (method) {
    case 'pdf-lib':
      return `Procesado con PDF-Lib (extracción rápida) - Confianza: ${confidence}%`;
    case 'ocr':
      return `Procesado con OCR (Tesseract.js) - Confianza: ${confidence}%`;
    case 'mammoth':
      return `Procesado con Mammoth (Word) - Confianza: ${confidence}%`;
    default:
      return `Método desconocido - Confianza: ${confidence}%`;
  }
}

/**
 * Clase principal para procesamiento híbrido de CVs
 */
export class CVProcessor {
  /**
   * Procesa un CV usando la estrategia híbrida óptima
   */
  async processCV(buffer: Buffer, fileName: string, mimeType: string): Promise<ProcessedFile> {
    console.log('🚀 CVProcessor iniciando procesamiento híbrido:', { fileName, mimeType });
    
    const startTime = Date.now();
    
    try {
      const result = await processFile(buffer, fileName, mimeType);
      const processingTime = Date.now() - startTime;
      
      console.log('✅ Procesamiento completado:', {
        method: result.metadata.processingMethod,
        confidence: result.metadata.confidence,
        wordCount: result.metadata.wordCount,
        processingTime: `${processingTime}ms`
      });
      
      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ CVProcessor error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: `${processingTime}ms`
      });
      throw error;
    }
  }
}