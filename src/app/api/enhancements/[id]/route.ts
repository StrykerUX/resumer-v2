import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enhancementId = params.id;

    // Buscar el enhancement y verificar que pertenece al usuario
    const enhancement = await prisma.enhancement.findFirst({
      where: {
        id: enhancementId,
        resume: {
          userId: session.user.id
        }
      },
      include: {
        resume: {
          select: {
            originalName: true,
            userId: true
          }
        }
      }
    });

    if (!enhancement) {
      return NextResponse.json({ error: 'Enhancement not found' }, { status: 404 });
    }

    return NextResponse.json(enhancement);
  } catch (error) {
    console.error('Error fetching enhancement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
