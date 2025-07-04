import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAIPipeline } from '@/lib/ai-pipeline';
import { CVProcessor, validateCVContent, cleanCVText, getProcessingInfo } from '@/lib/file-processor';

const ANALYSIS_COST = 10; // Costo en créditos para análisis

export async function POST(request: NextRequest) {
  let resumeId: string | null = null;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    resumeId = formData.get('resumeId') as string;
    const userAnswers = formData.get('userAnswers') as string;

    if (!resumeId) {
      return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
    }

    console.log('🎯 Iniciando análisis para resume:', resumeId);

    // Verificar que el usuario tenga créditos suficientes
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.credits < ANALYSIS_COST) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: ANALYSIS_COST,
        available: user?.credits || 0
      }, { status: 402 });
    }

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

    // Procesar el archivo usando el nuevo sistema híbrido
    const cvProcessor = new CVProcessor();
    const processedFile = await cvProcessor.processCV(fileBuffer, resume.originalName, resume.mimeType);
    
    // Mostrar información del método de procesamiento usado
    console.log('📊', getProcessingInfo(processedFile));

    // Validar contenido
    const validation = validateCVContent(processedFile);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Limpiar texto
    const cleanedText = cleanCVText(processedFile.text);

    // Parsear respuestas del usuario si existen
    let parsedAnswers: Record<string, string> = {};
    if (userAnswers) {
      try {
        parsedAnswers = JSON.parse(userAnswers);
      } catch (error) {
        console.error('Error parsing user answers:', error);
      }
    }

    // Actualizar estado del resume
    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: 'analyzing' }
    });

    // Crear perfil de usuario para el análisis
    const userProfile = {
      industry: parsedAnswers.industry || 'general',
      experienceLevel: parsedAnswers.experienceLevel || 'mid',
      targetRole: parsedAnswers.targetRole,
      careerObjective: parsedAnswers.careerObjective
    };

    // Ejecutar pipeline de análisis con IA especializada
    console.log('🧠 Ejecutando pipeline de análisis con IA experta...');
    const pipeline = createAIPipeline();
    
    const pipelineResult = await pipeline.executePipeline(
      'analysis',
      cleanedText,
      {
        userProfile,
        userId: session.user.id,
        resumeId: resumeId
      }
    );

    if (!pipelineResult.success) {
      throw new Error(`Pipeline failed: ${pipelineResult.error}`);
    }

    const analysisResult = pipelineResult.result as any;

    // Verificar si ya existe un análisis para este resume
    const existingAnalysis = await prisma.analysis.findUnique({
      where: { resumeId: resumeId }
    });

    let analysisRecord;
    if (existingAnalysis) {
      // Actualizar análisis existente
      analysisRecord = await prisma.analysis.update({
        where: { resumeId: resumeId },
        data: {
          aiAnalysis: {
            content: analysisResult.detailedFeedback || 'Análisis completado',
            processedText: cleanedText,
            metadata: processedFile.metadata,
            userAnswers: parsedAnswers,
            timestamp: new Date().toISOString(),
            pipelineResult: pipelineResult,
            categoryScores: analysisResult.categoryScores || {}
          },
          suggestions: {
            keywords: analysisResult.keywords || [],
            improvements: analysisResult.improvements || [],
            atsOptimization: analysisResult.atsOptimization || []
          },
          atsScore: analysisResult.overallScore || pipelineResult.finalScore || 0
        }
      });
    } else {
      // Crear nuevo análisis
      analysisRecord = await prisma.analysis.create({
        data: {
          resumeId: resumeId,
          aiAnalysis: {
            content: analysisResult.detailedFeedback || 'Análisis completado',
            processedText: cleanedText,
            metadata: processedFile.metadata,
            userAnswers: parsedAnswers,
            timestamp: new Date().toISOString(),
            pipelineResult: pipelineResult,
            categoryScores: analysisResult.categoryScores || {}
          },
          suggestions: {
            keywords: analysisResult.keywords || [],
            improvements: analysisResult.improvements || [],
            atsOptimization: analysisResult.atsOptimization || []
          },
          atsScore: analysisResult.overallScore || pipelineResult.finalScore || 0
        }
      });
    }

    // Descontar créditos del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: user.credits - ANALYSIS_COST }
    });

    // Registrar transacción de créditos
    await prisma.creditTransaction.create({
      data: {
        userId: session.user.id,
        amount: -ANALYSIS_COST,
        type: 'usage',
        description: 'Análisis de CV con IA'
      }
    });

    // Actualizar estado del resume
    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: 'completed' }
    });

    console.log('🎉 Análisis completado exitosamente');

    return NextResponse.json({
      success: true,
      analysisId: analysisRecord.id,
      analysis: analysisResult.detailedFeedback || 'Análisis completado',
      atsScore: analysisResult.overallScore || pipelineResult.finalScore || 0,
      creditsUsed: ANALYSIS_COST,
      remainingCredits: user.credits - ANALYSIS_COST,
      // Nuevos datos del pipeline
      categoryScores: analysisResult.categoryScores || {},
      strengths: analysisResult.strengths || [],
      improvements: analysisResult.improvements || [],
      recommendations: analysisResult.recommendations || [],
      keywords: analysisResult.keywords || [],
      atsOptimization: analysisResult.atsOptimization || [],
      pipelineInfo: {
        totalTime: pipelineResult.totalTime,
        stepsCompleted: pipelineResult.steps.length,
        finalScore: pipelineResult.finalScore
      },
      // Datos adicionales para el frontend
      processedText: cleanedText.substring(0, 500) + '...', // Preview del texto
      wordCount: processedFile.metadata.wordCount
    });

  } catch (error) {
    console.error('❌ Error in CV analysis:', error);
    
    // Intentar revertir estado del resume si hay error
    if (resumeId) {
      try {
        await prisma.resume.update({
          where: { id: resumeId },
          data: { status: 'error' }
        });
      } catch (revertError) {
        console.error('Error revirtiendo estado:', revertError);
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Función auxiliar para calcular score ATS
function calculateATSScore(text: string): number {
  let score = 0;
  const lowercaseText = text.toLowerCase();
  
  // Puntos por secciones típicas de CV
  const sections = ['experiencia', 'educación', 'habilidades', 'contacto', 'skills'];
  sections.forEach(section => {
    if (lowercaseText.includes(section)) score += 10;
  });
  
  // Puntos por información de contacto
  if (lowercaseText.includes('@') || lowercaseText.includes('email')) score += 10;
  if (lowercaseText.includes('teléfono') || lowercaseText.includes('telefono')) score += 10;
  
  // Puntos por formato estructurado
  if (text.includes('•') || text.includes('-') || text.includes('*')) score += 10;
  
  // Puntos por longitud apropiada
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 800) score += 20;
  
  return Math.min(score, 100);
}

// Función auxiliar para extraer palabras clave
function extractKeywords(text: string): string[] {
  const commonKeywords = [
    'liderazgo', 'gestión', 'análisis', 'desarrollo', 'comunicación',
    'teamwork', 'project management', 'problem solving', 'innovation',
    'estrategia', 'planificación', 'colaboración', 'eficiencia'
  ];
  
  const lowercaseText = text.toLowerCase();
  return commonKeywords.filter(keyword => 
    lowercaseText.includes(keyword.toLowerCase())
  );
}

// Función auxiliar para extraer mejoras del análisis
function extractImprovements(analysis: string): string[] {
  const lines = analysis.split('\n');
  const improvements: string[] = [];
  
  lines.forEach(line => {
    if (line.includes('recomiend') || line.includes('mejor') || line.includes('optimiz')) {
      improvements.push(line.trim());
    }
  });
  
  return improvements.slice(0, 5); // Máximo 5 mejoras principales
}

// Función auxiliar para generar optimización ATS
function generateATSOptimization(text: string): string[] {
  const optimizations = [];
  
  if (!text.includes('•') && !text.includes('-')) {
    optimizations.push('Usar viñetas para mejorar la legibilidad');
  }
  
  if (text.split(/\s+/).length > 800) {
    optimizations.push('Reducir la longitud del CV a 1-2 páginas');
  }
  
  if (!text.toLowerCase().includes('logr') && !text.toLowerCase().includes('result')) {
    optimizations.push('Incluir más logros cuantificables');
  }
  
  if (!text.includes('@')) {
    optimizations.push('Asegurar que la información de contacto esté visible');
  }
  
  return optimizations;
}