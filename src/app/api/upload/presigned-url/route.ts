import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { r2Client, R2_CONFIG } from '@/lib/r2-client'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileName, fileType, fileSize } = await request.json()

    // Validar tipo de archivo
    const allAllowedTypes = [
      ...R2_CONFIG.allowedTypes.image,
      ...R2_CONFIG.allowedTypes.document,
    ]
    
    if (!allAllowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no soportado' },
        { status: 400 }
      )
    }

    // Validar tamaño
    const isImage = R2_CONFIG.allowedTypes.image.includes(fileType)
    const maxSize = isImage ? R2_CONFIG.maxFileSize.image : R2_CONFIG.maxFileSize.document
    
    if (fileSize > maxSize) {
      return NextResponse.json(
        { 
          error: `Archivo muy grande. Máximo ${isImage ? '4MB' : '16MB'}` 
        },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const fileExtension = fileName.split('.').pop()
    const uniqueFileName = `resumes/${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    // Crear registro en base de datos (estado pendiente)
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        originalName: fileName,
        fileUrl: `${R2_CONFIG.publicUrl}/${uniqueFileName}`, // URL base para object key
        fileSize: fileSize,
        mimeType: fileType,
        status: 'uploading', // Estado inicial
      },
    })

    // Generar URL pre-firmada para upload
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: uniqueFileName,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        'resume-id': resume.id,
        'user-id': session.user.id,
        'original-name': fileName,
      },
    })

    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: R2_CONFIG.uploadExpiration,
    })

    return NextResponse.json({
      uploadUrl: signedUrl,
      resumeId: resume.id,
      fileUrl: resume.fileUrl,
      expiresIn: R2_CONFIG.uploadExpiration,
    })

  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}