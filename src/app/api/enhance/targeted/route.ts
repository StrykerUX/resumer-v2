import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAIPipelineVeraz } from '@/lib/ai-pipeline-veraz';
import { formatCVToHTML } from '@/lib/cv-formatter';

const TARGETED_ENHANCEMENT_COST = 25; // Costo en créditos para mejora especializada

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeId, jobDescription, jobTitle, companyName, keyRequirements } = await request.json();

    if (!resumeId) {
      return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
    }

    if (!jobDescription && !jobTitle) {
      return NextResponse.json({ 
        error: 'Job description or job title is required for targeted enhancement' 
      }, { status: 400 });
    }

    console.log('🎯 Iniciando mejora específica para resume:', resumeId);
    console.log('🎯 Puesto objetivo:', jobTitle || 'No especificado');
    console.log('🎯 Empresa:', companyName || 'No especificada');

    // Verificar que el usuario tenga créditos suficientes
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.credits < TARGETED_ENHANCEMENT_COST) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: TARGETED_ENHANCEMENT_COST,
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

    // Construir información del trabajo objetivo
    const jobInfo = {
      title: jobTitle || '',
      company: companyName || '',
      description: jobDescription || '',
      requirements: keyRequirements || []
    };

    // Verificar si ya existe una mejora específica para este CV con la misma descripción
    const existingEnhancement = await prisma.enhancement.findFirst({
      where: {
        resumeId: resumeId,
        enhancementType: 'targeted',
        jobDescription: JSON.stringify(jobInfo)
      }
    });

    if (existingEnhancement && existingEnhancement.status === 'completed') {
      return NextResponse.json({
        success: true,
        enhancement: existingEnhancement,
        message: 'Targeted enhancement already exists for this resume and job'
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

    console.log('📊 Datos del análisis extraídos:');
    console.log('- Texto original:', originalText?.substring(0, 100) + '...');
    console.log('- Mejoras sugeridas:', improvements.length);
    console.log('- Palabras clave:', keywords.length);
    console.log('- Optimizaciones ATS:', atsOptimization.length);

    // Crear registro de enhancement
    const enhancement = await prisma.enhancement.create({
      data: {
        resumeId: resumeId,
        enhancementType: 'targeted',
        jobDescription: JSON.stringify(jobInfo),
        creditsUsed: TARGETED_ENHANCEMENT_COST,
        status: 'processing',
        enhancedContent: {
          originalText: originalText,
          jobInfo: jobInfo,
          analysisData: {
            improvements: improvements,
            keywords: keywords,
            atsOptimization: atsOptimization,
            atsScore: resume.analysis.atsScore
          }
        }
      }
    });

    console.log('✨ Ejecutando pipeline especializado de mejora...');

    // Crear perfil de usuario para el enhancement
    const userProfile = {
      industry: analysisData.userAnswers?.industry || 'general',
      experienceLevel: analysisData.userAnswers?.experienceLevel || 'mid',
      targetRole: jobInfo.title || analysisData.userAnswers?.targetRole,
      careerObjective: analysisData.userAnswers?.careerObjective
    };

    // Crear contexto del trabajo objetivo
    const jobContext = {
      title: jobInfo.title,
      company: jobInfo.company,
      description: jobInfo.description,
      requirements: Array.isArray(jobInfo.requirements) ? jobInfo.requirements : [],
      preferredSkills: [],
      keywordDensity: {}
    };

    // Ejecutar pipeline VERAZ especializado (Extractor + Analyzer + A1 + A2 + A3 + A4 + Fact Checker + A5)
    const pipeline = createAIPipelineVeraz();
    
    const pipelineResult = await pipeline.executePipeline(
      'specialized',
      originalText,
      {
        userProfile,
        jobContext,
        userId: session.user.id,
        resumeId: resumeId
      }
    );

    if (!pipelineResult.success) {
      throw new Error(`Pipeline failed: ${pipelineResult.error}`);
    }

    const enhancementResult = pipelineResult.result as any;
    const enhancedContentMarkdown = enhancementResult.enhancedContent;
    
    // Formatear CV de Markdown a HTML profesional
    const enhancedContentHTML = formatCVToHTML(enhancedContentMarkdown);

    // Actualizar enhancement con el contenido mejorado
    const updatedEnhancement = await prisma.enhancement.update({
      where: { id: enhancement.id },
      data: {
        status: 'completed',
        enhancedContent: {
          originalText: originalText,
          enhancedText: enhancedContentHTML,
          enhancedMarkdown: enhancedContentMarkdown,
          jobInfo: jobInfo,
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
            enhancementType: 'specialized',
            processedAt: new Date().toISOString(),
            creditsUsed: TARGETED_ENHANCEMENT_COST,
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
      data: { credits: user.credits - TARGETED_ENHANCEMENT_COST }
    });

    // Registrar transacción de créditos
    await prisma.creditTransaction.create({
      data: {
        userId: session.user.id,
        amount: -TARGETED_ENHANCEMENT_COST,
        type: 'usage',
        description: `Mejora especializada de CV con pipeline de 6 IAs para: ${jobTitle || 'puesto específico'}`
      }
    });

    console.log('🎉 Mejora especializada completada exitosamente');

    return NextResponse.json({
      success: true,
      enhancementId: updatedEnhancement.id,
      enhancedContent: enhancedContentHTML,
      enhancedMarkdown: enhancedContentMarkdown,
      jobInfo: jobInfo,
      creditsUsed: TARGETED_ENHANCEMENT_COST,
      remainingCredits: user.credits - TARGETED_ENHANCEMENT_COST,
      enhancement: updatedEnhancement,
      // Datos del pipeline especializado
      pipelineInfo: {
        type: 'specialized',
        totalTime: pipelineResult.totalTime,
        stepsCompleted: pipelineResult.steps.length,
        finalScore: pipelineResult.finalScore,
        aisUsed: [
          'Content Enhancer',
          'Position Enhancer (alineación específica)',
          'Industry Recruiter', 
          'Expert Senior Recruiter',
          'Head Hunter Enhancer',
          'Humanizer & Format Expert'
        ]
      },
      scoreImprovement: enhancementResult.scoreImprovement || {},
      improvementsSummary: enhancementResult.improvementsSummary || [],
      changesExplanation: enhancementResult.changesExplanation || 'Mejoras especializadas aplicadas con 6 IAs para alineación perfecta al puesto objetivo'
    });

  } catch (error) {
    console.error('❌ Error in targeted enhancement:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}