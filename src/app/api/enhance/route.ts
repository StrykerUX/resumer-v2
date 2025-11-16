import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateGeneralImprovement, generateTargetedImprovement } from '@/lib/openai';
import { CVProcessor, validateCVContent, cleanCVText } from '@/lib/file-processor';

const GENERAL_ENHANCEMENT_COST = 10; // Costo en créditos para mejora general
const TARGETED_ENHANCEMENT_COST = 15; // Costo en créditos para mejora específica

export async function POST(request: NextRequest) {
  let resumeId: string | null = null;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    resumeId = formData.get('resumeId') as string;
    const enhancementType = formData.get('type') as 'general' | 'targeted';
    const jobDescription = formData.get('jobDescription') as string | null;

    if (!resumeId) {
      return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
    }

    if (!enhancementType || !['general', 'targeted'].includes(enhancementType)) {
      return NextResponse.json({ error: 'Invalid enhancement type' }, { status: 400 });
    }

    if (enhancementType === 'targeted' && !jobDescription) {
      return NextResponse.json({ error: 'Job description is required for targeted enhancement' }, { status: 400 });
    }

    console.log(`🎯 Iniciando mejora ${enhancementType} para resume:`, resumeId);

    // Determinar costo según tipo de mejora
    const enhancementCost = enhancementType === 'general' ? GENERAL_ENHANCEMENT_COST : TARGETED_ENHANCEMENT_COST;

    // Verificar que el usuario tenga créditos suficientes
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.credits < enhancementCost) {
      return NextResponse.json({
        error: 'Insufficient credits',
        required: enhancementCost,
        available: user?.credits || 0
      }, { status: 402 });
    }

    // Verificar que el resume pertenece al usuario
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id
      },
      include: {
        analysis: true
      }
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Verificar que existe un análisis previo
    if (!resume.analysis) {
      return NextResponse.json({
        error: 'Analysis required',
        message: 'Debes analizar el CV antes de mejorarlo'
      }, { status: 400 });
    }

    console.log('🔒 Generando URL pre-firmada para descarga segura desde R2');

    // Usar funciones helper para mayor seguridad y limpieza
    const { generatePresignedDownloadUrl, extractObjectKey } = await import('@/lib/r2-client');

    // Extraer object key desde la URL almacenada
    const objectKey = extractObjectKey(resume.fileUrl);
    console.log('🔑 Object key:', objectKey);

    // Generar URL pre-firmada con expiración de 5 minutos
    const presignedUrl = await generatePresignedDownloadUrl(objectKey, 300);
    console.log('✅ URL pre-firmada generada (expires in 5 min)');

    // Descargar archivo usando URL pre-firmada temporal
    const fileResponse = await fetch(presignedUrl);
    if (!fileResponse.ok) {
      console.error('❌ Error descargando:', fileResponse.status, fileResponse.statusText);
      throw new Error(`No se pudo descargar el archivo desde R2: ${fileResponse.status} ${fileResponse.statusText}`);
    }

    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    console.log('✅ Archivo descargado, tamaño:', fileBuffer.length, 'bytes');

    // Procesar el archivo usando el sistema híbrido
    const cvProcessor = new CVProcessor();
    const processedFile = await cvProcessor.processCV(fileBuffer, resume.originalName, resume.mimeType);

    // Validar contenido
    const validation = validateCVContent(processedFile);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Limpiar texto
    const cleanedText = cleanCVText(processedFile.text);

    // Obtener análisis previo
    const analysisContent = typeof resume.analysis.aiAnalysis === 'object'
      ? JSON.stringify(resume.analysis.aiAnalysis)
      : resume.analysis.aiAnalysis;

    // Generar mejora según el tipo
    let enhancedContent: string;

    if (enhancementType === 'general') {
      console.log('✨ Generando mejora general...');
      enhancedContent = await generateGeneralImprovement(cleanedText, analysisContent);
    } else {
      console.log('🎯 Generando mejora específica...');
      enhancedContent = await generateTargetedImprovement(cleanedText, jobDescription!, analysisContent);
    }

    // Crear registro de mejora
    const enhancement = await prisma.enhancement.create({
      data: {
        resumeId: resumeId,
        enhancementType: enhancementType,
        jobDescription: jobDescription,
        enhancedContent: {
          content: enhancedContent,
          originalText: cleanedText,
          timestamp: new Date().toISOString(),
          metadata: processedFile.metadata
        },
        creditsUsed: enhancementCost,
        status: 'completed'
      }
    });

    // Descontar créditos del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: user.credits - enhancementCost }
    });

    // Registrar transacción de créditos
    await prisma.creditTransaction.create({
      data: {
        userId: session.user.id,
        amount: -enhancementCost,
        type: 'usage',
        description: `Mejora ${enhancementType === 'general' ? 'general' : 'específica'} de CV`
      }
    });

    console.log('🎉 Mejora completada exitosamente');

    return NextResponse.json({
      success: true,
      enhancementId: enhancement.id,
      enhancedContent: enhancedContent,
      creditsUsed: enhancementCost,
      remainingCredits: user.credits - enhancementCost,
      enhancementType: enhancementType
    });

  } catch (error) {
    console.error('❌ Error in CV enhancement:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
