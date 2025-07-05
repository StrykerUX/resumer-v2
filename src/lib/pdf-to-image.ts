// Módulo para conversión de PDF a imagen optimizada para OpenAI Vision
// Combina pdf2pic + sharp para máxima calidad

import { fromBuffer } from 'pdf2pic';
import sharp from 'sharp';

export interface PDFToImageResult {
  success: boolean;
  images: Buffer[];
  pageCount: number;
  totalSize: number;
  processingTime: number;
  method: 'pdf2pic';
  error?: string;
}

export interface PDFToImageOptions {
  // Configuración optimizada para OpenAI Vision
  density: number;           // DPI para conversión (default: 150)
  format: 'png' | 'jpeg';   // Formato de salida (default: 'png')
  quality: number;           // Calidad JPEG 1-100 (default: 95)
  maxPages: number;          // Máximo páginas a procesar (default: 3)
  maxWidth: number;          // Ancho máximo px (default: 2048)
  maxHeight: number;         // Alto máximo px (default: 2048)
  backgroundColor: string;   // Color de fondo (default: 'white')
}

export class PDFToImageConverter {
  
  private static readonly DEFAULT_OPTIONS: PDFToImageOptions = {
    density: 150,           // Buena calidad sin ser excesivo
    format: 'png',          // PNG para mejor calidad de texto
    quality: 95,            // Alta calidad para JPEG (si se usa)
    maxPages: 3,            // Limitar a 3 páginas para performance
    maxWidth: 2048,         // Máximo soportado por OpenAI Vision
    maxHeight: 2048,        // Máximo soportado por OpenAI Vision
    backgroundColor: 'white' // Fondo blanco para mejor contraste
  };

  static async convertPDFToImages(
    pdfBuffer: Buffer,
    fileName: string,
    options: Partial<PDFToImageOptions> = {}
  ): Promise<PDFToImageResult> {
    const startTime = Date.now();
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      console.log('🔄 Convirtiendo PDF a imágenes...', {
        fileName,
        targetFormat: config.format,
        density: config.density,
        maxPages: config.maxPages
      });

      // Configurar pdf2pic con opciones optimizadas
      const convert = fromBuffer(pdfBuffer, {
        density: config.density,
        format: config.format,
        out_dir: undefined, // No guardar en disco, mantener en memoria
        out_prefix: 'page',
        page: null // Convertir todas las páginas (limitado por maxPages)
      });

      // Convertir páginas a imágenes
      const conversionResults = await convert.bulk(-1, {
        responseType: 'buffer'
      });

      if (!conversionResults || conversionResults.length === 0) {
        throw new Error('No se pudieron convertir páginas del PDF');
      }

      // Limitar número de páginas
      const limitedResults = conversionResults.slice(0, config.maxPages);
      
      console.log(`✅ PDF convertido: ${limitedResults.length} página(s) → ${limitedResults.length} imagen(es)`);

      // Optimizar cada imagen con Sharp
      const optimizedImages: Buffer[] = [];
      let totalSize = 0;

      for (let i = 0; i < limitedResults.length; i++) {
        const pageResult = limitedResults[i];
        
        if (!pageResult.buffer) {
          console.warn(`⚠️ Página ${i + 1} no tiene buffer, saltando...`);
          continue;
        }

        console.log(`🖼️ Optimizando página ${i + 1}/${limitedResults.length}...`);

        // Optimizar con Sharp
        const optimizedBuffer = await this.optimizeImageForVision(
          pageResult.buffer as Buffer,
          config
        );

        optimizedImages.push(optimizedBuffer);
        totalSize += optimizedBuffer.length;

        console.log(`✅ Página ${i + 1} optimizada: ${optimizedBuffer.length} bytes`);
      }

      const processingTime = Date.now() - startTime;

      console.log(`🎉 Conversión PDF→Imagen completada:`, {
        páginas: optimizedImages.length,
        tamañoTotal: `${Math.round(totalSize / 1024)}KB`,
        tiempo: `${processingTime}ms`
      });

      return {
        success: true,
        images: optimizedImages,
        pageCount: optimizedImages.length,
        totalSize,
        processingTime,
        method: 'pdf2pic'
      };

    } catch (error) {
      console.error('❌ Error en conversión PDF→Imagen:', error);
      
      return {
        success: false,
        images: [],
        pageCount: 0,
        totalSize: 0,
        processingTime: Date.now() - startTime,
        method: 'pdf2pic',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Optimizar imagen específicamente para OpenAI Vision
  private static async optimizeImageForVision(
    imageBuffer: Buffer,
    config: PDFToImageOptions
  ): Promise<Buffer> {
    try {
      let pipeline = sharp(imageBuffer);

      // Obtener metadata de la imagen
      const metadata = await pipeline.metadata();
      const originalWidth = metadata.width || 0;
      const originalHeight = metadata.height || 0;

      // Redimensionar si excede límites de OpenAI Vision
      if (originalWidth > config.maxWidth || originalHeight > config.maxHeight) {
        pipeline = pipeline.resize(config.maxWidth, config.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Asegurar fondo blanco para mejor contraste de texto
      if (config.backgroundColor === 'white') {
        pipeline = pipeline.flatten({ background: '#ffffff' });
      }

      // Optimizar según formato
      if (config.format === 'png') {
        pipeline = pipeline.png({
          compressionLevel: 6, // Buen balance calidad/tamaño
          quality: 95
        });
      } else {
        pipeline = pipeline.jpeg({
          quality: config.quality,
          progressive: true
        });
      }

      // Aplicar sharpening sutil para mejorar legibilidad de texto
      pipeline = pipeline.sharpen({
        sigma: 0.5,
        m1: 1.0,
        m2: 0.2
      });

      const optimizedBuffer = await pipeline.toBuffer();
      
      return optimizedBuffer;

    } catch (error) {
      console.warn('⚠️ Error optimizando imagen, usando original:', error);
      return imageBuffer;
    }
  }

  // Función helper para verificar si el PDF necesita conversión
  static shouldConvertPDF(mimeType: string, fileSize: number): boolean {
    // Solo convertir PDFs
    if (mimeType !== 'application/pdf') {
      return false;
    }

    // No convertir PDFs muy grandes (>10MB) para evitar timeouts
    const maxSizeForConversion = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSizeForConversion) {
      console.warn(`⚠️ PDF muy grande (${Math.round(fileSize / 1024 / 1024)}MB), saltando conversión`);
      return false;
    }

    return true;
  }

  // Función helper para crear data URLs para OpenAI
  static createDataURLsFromImages(images: Buffer[], format: 'png' | 'jpeg' = 'png'): string[] {
    return images.map((imageBuffer, index) => {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const base64 = imageBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    });
  }

  // Función para estimar el costo en tokens de OpenAI
  static estimateVisionTokens(images: Buffer[]): number {
    // OpenAI Vision: ~85 tokens por imagen de baja res, ~170 por alta res
    // Usamos estimación conservadora de 170 tokens por imagen
    return images.length * 170;
  }

  // Función para validar que las imágenes sean válidas
  static async validateImages(images: Buffer[]): Promise<boolean> {
    if (!images || images.length === 0) {
      return false;
    }

    try {
      // Verificar que cada imagen sea válida con Sharp
      for (const imageBuffer of images) {
        const metadata = await sharp(imageBuffer).metadata();
        if (!metadata.width || !metadata.height) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('❌ Error validando imágenes:', error);
      return false;
    }
  }
}

// Función helper para uso directo
export async function convertPDFToOptimizedImages(
  pdfBuffer: Buffer,
  fileName: string,
  maxPages: number = 3
): Promise<PDFToImageResult> {
  return PDFToImageConverter.convertPDFToImages(pdfBuffer, fileName, {
    maxPages,
    density: 150,
    format: 'png',
    maxWidth: 2048,
    maxHeight: 2048
  });
}

export default PDFToImageConverter;