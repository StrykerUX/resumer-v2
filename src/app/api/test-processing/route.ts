import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CVProcessor, validateCVContent, cleanCVText, getProcessingInfo } from '@/lib/file-processor';

/**
 * Endpoint temporal para testear SOLO el sistema multi-modal
 * Sin usar OpenAI - para verificar que el procesamiento funciona
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Soportar tanto FormData como JSON
    let resumeId: string;
    
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      resumeId = body.resumeId;
    } else {
      const formData = await request.formData();
      resumeId = formData.get('resumeId') as string;
    }

    if (!resumeId) {
      return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
    }

    console.log('🧪 TESTING - Iniciando test de procesamiento para resume:', resumeId);

    // Verificar que el resume pertenece al usuario
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id
      }
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    console.log('🔒 TESTING - Generando URL pre-firmada para descarga segura desde R2');

    // Usar funciones helper para mayor seguridad y limpieza
    const { generatePresignedDownloadUrl, extractObjectKey } = await import('@/lib/r2-client');

    // Extraer object key desde la URL almacenada
    const objectKey = extractObjectKey(resume.fileUrl);
    console.log('🔑 TESTING - Object key:', objectKey);

    // Generar URL pre-firmada con expiración de 5 minutos
    const presignedUrl = await generatePresignedDownloadUrl(objectKey, 300);
    console.log('✅ TESTING - URL pre-firmada generada (expires in 5 min)');

    // Descargar archivo usando URL pre-firmada temporal
    const fileResponse = await fetch(presignedUrl);
    if (!fileResponse.ok) {
      console.error('❌ TESTING - Error descargando:', fileResponse.status, fileResponse.statusText);
      throw new Error(`No se pudo descargar el archivo desde R2: ${fileResponse.status} ${fileResponse.statusText}`);
    }

    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    console.log('✅ TESTING - Archivo descargado, tamaño:', fileBuffer.length, 'bytes');

    // 🚀 PROCESAR EL ARCHIVO USANDO EL NUEVO SISTEMA HÍBRIDO
    const cvProcessor = new CVProcessor();
    const processedFile = await cvProcessor.processCV(fileBuffer, resume.originalName, resume.mimeType);
    
    // Mostrar información del método de procesamiento usado
    console.log('📊 TESTING -', getProcessingInfo(processedFile));

    // Validar contenido
    const validation = validateCVContent(processedFile);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.error,
        testResults: {
          processed: true,
          validation: false,
          processingInfo: getProcessingInfo(processedFile)
        }
      }, { status: 400 });
    }

    // Limpiar texto
    const cleanedText = cleanCVText(processedFile.text);

    console.log('✅ TESTING - Procesamiento completado exitosamente');

    // Retornar resultados del test (SIN análisis de OpenAI)
    return NextResponse.json({
      success: true,
      testResults: {
        fileName: resume.originalName,
        fileSize: fileBuffer.length,
        processingMethod: processedFile.metadata.processingMethod,
        confidence: processedFile.metadata.confidence,
        wordCount: processedFile.metadata.wordCount,
        pageCount: processedFile.metadata.pageCount,
        processingInfo: getProcessingInfo(processedFile),
        textSample: cleanedText.substring(0, 200) + '...', // Muestra primeros 200 caracteres
        validation: {
          valid: validation.valid,
          message: 'Contenido validado correctamente'
        }
      },
      message: '🎉 Sistema multi-modal funcionando PERFECTAMENTE - Sin OpenAI'
    });

  } catch (error) {
    console.error('❌ TESTING - Error en test de procesamiento:', error);
    return NextResponse.json({ 
      error: 'Test processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}