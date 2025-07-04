import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/enhance - Obtener mejoras de un CV específico o todas las mejoras del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');

    if (resumeId) {
      // Obtener mejoras específicas de un CV
      const resume = await prisma.resume.findFirst({
        where: {
          id: resumeId,
          userId: session.user.id
        },
        include: {
          enhancements: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!resume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        resume: {
          id: resume.id,
          originalName: resume.originalName,
          status: resume.status
        },
        enhancements: resume.enhancements
      });
    } else {
      // Obtener todas las mejoras del usuario
      const enhancements = await prisma.enhancement.findMany({
        where: {
          resume: {
            userId: session.user.id
          }
        },
        include: {
          resume: {
            select: {
              id: true,
              originalName: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10 // Últimas 10 mejoras
      });

      return NextResponse.json({
        success: true,
        enhancements: enhancements
      });
    }

  } catch (error) {
    console.error('Error fetching enhancements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}