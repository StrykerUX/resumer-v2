import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/credits - Obtener balance de créditos del usuario
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        credits: true,
        email: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener historial de transacciones (últimas 10)
    const transactions = await prisma.creditTransaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        currency: true,
        priceId: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        credits: user.credits,
        userId: user.id,
        email: user.email,
        memberSince: user.createdAt,
        transactions: transactions,
      },
    })

  } catch (error) {
    console.error('Error getting credits:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/credits - Actualizar créditos (solo para testing interno)
export async function POST(request: NextRequest) {
  try {
    // Solo permitir en modo desarrollo
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Operación no permitida en producción' },
        { status: 403 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { amount, type, description } = await request.json()

    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar créditos del usuario
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: {
          increment: amount,
        },
      },
    })

    // Crear registro de transacción
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount: amount,
        type: type,
        description: description || `${type} de ${amount} créditos`,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        credits: updatedUser.credits,
        transaction: {
          amount,
          type,
          description,
        },
      },
    })

  } catch (error) {
    console.error('Error updating credits:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}