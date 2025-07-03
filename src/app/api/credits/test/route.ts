import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/credits/test - Versión simplificada para debugging
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test API called')
    
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    console.log('🔐 Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      email: session?.user?.email
    })
    
    if (!session?.user?.email) {
      console.log('❌ No session found')
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    console.log('✅ Session found, searching user...')
    
    // Buscar usuario - versión más simple
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        credits: true,
        email: true,
      },
    })

    console.log('👤 User found:', {
      hasUser: !!user,
      userId: user?.id,
      credits: user?.credits
    })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ Returning user data successfully')
    
    return NextResponse.json({
      success: true,
      data: {
        credits: user.credits,
        userId: user.id,
        email: user.email,
      },
    })

  } catch (error) {
    console.error('❌ Test API Error:', error)
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown')
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}