import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAIPipeline } from '@/lib/ai-pipeline';

const ADVANCED_ENHANCEMENT_COST = 20; // Costo en créditos para mejora avanzada

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeId } = await request.json();

    if (!resumeId) {
      return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
    }

    console.log('🔧 Iniciando mejora avanzada para resume:', resumeId);

    // Verificar que el usuario tenga créditos suficientes
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.credits < ADVANCED_ENHANCEMENT_COST) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: ADVANCED_ENHANCEMENT_COST,
        available: user?.credits || 0
      }, { status: 402 });
    }

    // Verificar que el resume pertenece al usuario y tiene análisis
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

    if (!resume.analysis) {
      return NextResponse.json({ 
        error: 'Resume analysis not found. Please analyze the resume first.' 
      }, { status: 400 });
    }

    // Verificar si ya existe una mejora avanzada para este CV
    const existingEnhancement = await prisma.enhancement.findFirst({
      where: {
        resumeId: resumeId,
        enhancementType: 'advanced'
      }
    });

    if (existingEnhancement && existingEnhancement.status === 'completed') {
      return NextResponse.json({
        success: true,
        enhancement: existingEnhancement,
        message: 'Advanced enhancement already exists for this resume'
      });
    }

    // Extraer información del análisis existente
    const analysisData = resume.analysis.aiAnalysis as any;
    const suggestions = resume.analysis.suggestions as any;
    
    const improvements = suggestions.improvements || [];
    const keywords = suggestions.keywords || [];
    const atsOptimization = suggestions.atsOptimization || [];

    console.log('🚀 Iniciando extracción híbrida OpenAI Vision + Local...');

    // Descargar archivo original desde R2
    const { generatePresignedDownloadUrl, extractObjectKey } = await import('@/lib/r2-client');
    const objectKey = extractObjectKey(resume.fileUrl);
    const presignedUrl = await generatePresignedDownloadUrl(objectKey, 300);
    
    const fileResponse = await fetch(presignedUrl);
    if (!fileResponse.ok) {
      throw new Error(`No se pudo descargar el archivo desde R2: ${fileResponse.status}`);
    }

    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    
    // Usar el extractor híbrido OpenAI Vision + Local
    const { OpenAIVisionExtractor } = await import('@/lib/openai-vision-extractor');
    const extractionResult = await OpenAIVisionExtractor.extractTextFromFile(
      fileBuffer, 
      resume.originalName, 
      resume.mimeType, 
      'hybrid'
    );

    if (!extractionResult.success) {
      throw new Error('No se pudo extraer texto del archivo con ningún método');
    }

    const originalText = extractionResult.text;
    console.log(`✅ Extracción híbrida exitosa:`, {
      método: extractionResult.method,
      confianza: extractionResult.confidence,
      caracteres: originalText.length,
      palabras: extractionResult.wordCount,
      tiempo: extractionResult.metadata.processingTime + 'ms'
    });

    console.log('📊 Datos del análisis extraídos para mejora avanzada:');
    console.log('- Texto original:', originalText?.substring(0, 100) + '...');
    console.log('- Mejoras sugeridas:', improvements.length);
    console.log('- Palabras clave:', keywords.length);
    console.log('- Optimizaciones ATS:', atsOptimization.length);

    // Crear registro de enhancement
    const enhancement = await prisma.enhancement.create({
      data: {
        resumeId: resumeId,
        enhancementType: 'advanced',
        creditsUsed: ADVANCED_ENHANCEMENT_COST,
        status: 'processing',
        enhancedContent: {
          originalText: originalText,
          analysisData: {
            improvements: improvements,
            keywords: keywords,
            atsOptimization: atsOptimization,
            atsScore: resume.analysis.atsScore
          }
        }
      }
    });

    console.log('✨ Ejecutando pipeline avanzado de mejora...');

    // Crear perfil de usuario para el enhancement
    const userProfile = {
      industry: analysisData.userAnswers?.industry || 'general',
      experienceLevel: analysisData.userAnswers?.experienceLevel || 'mid',
      targetRole: analysisData.userAnswers?.targetRole,
      careerObjective: analysisData.userAnswers?.careerObjective
    };

    // Ejecutar pipeline avanzado (Content Enhancer + Industry Recruiter + Expert Recruiter + Head Hunter + Humanizer)
    const pipeline = createAIPipeline();
    
    const pipelineResult = await pipeline.executePipeline(
      'advanced',
      originalText,
      {
        userProfile,
        userId: session.user.id,
        resumeId: resumeId,
        analysisResult: {
          improvements: improvements,
          keywords: keywords,
          atsOptimization: atsOptimization,
          atsScore: resume.analysis.atsScore
        }
      }
    );

    if (!pipelineResult.success) {
      throw new Error(`Pipeline failed: ${pipelineResult.error}`);
    }

    const enhancementResult = pipelineResult.result as any;
    const enhancedContent = enhancementResult.enhancedContent;

    // Actualizar enhancement con el contenido mejorado
    const updatedEnhancement = await prisma.enhancement.update({
      where: { id: enhancement.id },
      data: {
        status: 'completed',
        enhancedContent: {
          originalText: originalText,
          enhancedText: enhancedContent,
          analysisData: {
            improvements: improvements,
            keywords: keywords,
            atsOptimization: atsOptimization,
            atsScore: resume.analysis.atsScore
          },
          pipelineResult: pipelineResult,
          scoreImprovement: enhancementResult.scoreImprovement || {},
          improvementsSummary: enhancementResult.improvementsSummary || [],
          metadata: {
            enhancementType: 'advanced',
            processedAt: new Date().toISOString(),
            creditsUsed: ADVANCED_ENHANCEMENT_COST,
            totalTime: pipelineResult.totalTime,
            stepsCompleted: pipelineResult.steps.length,
            finalScore: pipelineResult.finalScore
          }
        }
      }
    });

    // Descontar créditos del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: user.credits - ADVANCED_ENHANCEMENT_COST }
    });

    // Registrar transacción de créditos
    await prisma.creditTransaction.create({
      data: {
        userId: session.user.id,
        amount: -ADVANCED_ENHANCEMENT_COST,
        type: 'usage',
        description: 'Mejora avanzada de CV con pipeline de 5 IAs'
      }
    });

    console.log('🎉 Mejora avanzada completada exitosamente');

    return NextResponse.json({
      success: true,
      enhancementId: updatedEnhancement.id,
      enhancedContent: enhancedContent,
      creditsUsed: ADVANCED_ENHANCEMENT_COST,
      remainingCredits: user.credits - ADVANCED_ENHANCEMENT_COST,
      enhancement: updatedEnhancement,
      // Datos del pipeline avanzado
      pipelineInfo: {
        type: 'advanced',
        totalTime: pipelineResult.totalTime,
        stepsCompleted: pipelineResult.steps.length,
        finalScore: pipelineResult.finalScore,
        aisUsed: [
          'Content Enhancer',
          'Industry Recruiter', 
          'Expert Senior Recruiter',
          'Head Hunter Enhancer',
          'Humanizer & Format Expert'
        ]
      },
      scoreImprovement: enhancementResult.scoreImprovement || {},
      improvementsSummary: enhancementResult.improvementsSummary || [],
      changesExplanation: enhancementResult.changesExplanation || 'Mejoras avanzadas aplicadas con 5 IAs especializadas'
    });

  } catch (error) {
    console.error('❌ Error in advanced enhancement:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}