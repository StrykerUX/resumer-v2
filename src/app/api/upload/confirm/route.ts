import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeId, success } = await request.json()

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID required' }, { status: 400 })
    }

    // Verificar que el resume pertenece al usuario
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Actualizar estado del resume
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        status: success ? 'uploaded' : 'error',
        updatedAt: new Date(),
      },
    })

    if (!success) {
      // Si el upload falló, podrías eliminar el registro o marcar como error
      console.log(`Upload failed for resume ${resumeId}`)
    }

    return NextResponse.json({
      resumeId: updatedResume.id,
      status: updatedResume.status,
      fileUrl: updatedResume.fileUrl,
    })

  } catch (error) {
    console.error('Error confirming upload:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}