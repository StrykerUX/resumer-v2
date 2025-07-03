import mammoth from 'mammoth';

export interface ProcessedFile {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    pageCount?: number;
    wordCount: number;
  };
}

/**
 * Procesa un archivo PDF y extrae el texto
 */
export async function processPDF(buffer: Buffer, fileName: string): Promise<ProcessedFile> {
  try {
    // Importación dinámica para evitar problemas en build
    const pdf = (await import('pdf-parse')).default;
    const data = await pdf(buffer);
    
    return {
      text: data.text,
      metadata: {
        fileName,
        fileType: 'pdf',
        fileSize: buffer.length,
        pageCount: data.numpages,
        wordCount: data.text.split(/\s+/).length
      }
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF file');
  }
}

/**
 * Procesa un archivo Word (docx) y extrae el texto
 */
export async function processWord(buffer: Buffer, fileName: string): Promise<ProcessedFile> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    return {
      text: result.value,
      metadata: {
        fileName,
        fileType: 'docx',
        fileSize: buffer.length,
        wordCount: result.value.split(/\s+/).length
      }
    };
  } catch (error) {
    console.error('Error processing Word document:', error);
    throw new Error('Failed to process Word document');
  }
}

/**
 * Procesa un archivo basado en su tipo
 */
export async function processFile(buffer: Buffer, fileName: string, mimeType: string): Promise<ProcessedFile> {
  if (mimeType === 'application/pdf') {
    return processPDF(buffer, fileName);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return processWord(buffer, fileName);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
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
  
  // Verificar que contenga información típica de CV
  const cvKeywords = [
    'experiencia', 'trabajo', 'educación', 'habilidades', 'skills',
    'universidad', 'carrera', 'profesional', 'empresa', 'puesto',
    'contacto', 'email', 'teléfono', 'dirección'
  ];
  
  const lowercaseText = text.toLowerCase();
  const hasRelevantContent = cvKeywords.some(keyword => 
    lowercaseText.includes(keyword)
  );
  
  if (!hasRelevantContent) {
    return { valid: false, error: 'El archivo no parece contener información de CV' };
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
    // Remover caracteres no imprimibles
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, '')
    // Normalizar espacios
    .replace(/\s{2,}/g, ' ');
}