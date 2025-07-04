import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enhanceCV } from '@/lib/openai';

const TARGETED_ENHANCEMENT_COST = 15; // Costo en créditos para mejora específica

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
    
    const originalText = analysisData.processedText;
    const aiAnalysis = analysisData.content;
    const improvements = suggestions.improvements || [];
    const keywords = suggestions.keywords || [];
    const atsOptimization = suggestions.atsOptimization || [];

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

    console.log('✨ Generando mejora específica con IA...');

    // Generar mejora usando IA con información del trabajo
    const enhancedContent = await enhanceCV(
      originalText,
      aiAnalysis,
      improvements,
      keywords,
      atsOptimization,
      'targeted',
      jobInfo
    );

    // Actualizar enhancement con el contenido mejorado
    const updatedEnhancement = await prisma.enhancement.update({
      where: { id: enhancement.id },
      data: {
        status: 'completed',
        enhancedContent: {
          originalText: originalText,
          enhancedText: enhancedContent,
          jobInfo: jobInfo,
          analysisData: {
            improvements: improvements,
            keywords: keywords,
            atsOptimization: atsOptimization,
            atsScore: resume.analysis.atsScore
          },
          metadata: {
            enhancementType: 'targeted',
            processedAt: new Date().toISOString(),
            creditsUsed: TARGETED_ENHANCEMENT_COST
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
        description: `Mejora específica de CV para: ${jobTitle || 'puesto específico'}`
      }
    });

    console.log('🎉 Mejora específica completada exitosamente');

    return NextResponse.json({
      success: true,
      enhancementId: updatedEnhancement.id,
      enhancedContent: enhancedContent,
      jobInfo: jobInfo,
      creditsUsed: TARGETED_ENHANCEMENT_COST,
      remainingCredits: user.credits - TARGETED_ENHANCEMENT_COST,
      enhancement: updatedEnhancement
    });

  } catch (error) {
    console.error('❌ Error in targeted enhancement:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}