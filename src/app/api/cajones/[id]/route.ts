import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { CajonUpdateSchema } from "@/lib/validations/cajon";
import { logger } from "@/lib/logger";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const cajon = await prisma.cajon.findUnique({
      where: { id },
      include: {
        estanteria: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            ubicacion: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
              }
            }
          }
        },
        armario: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            ubicacion: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
              }
            }
          }
        },
        divisiones: {
          include: {
            _count: {
              select: {
                repuestos: true,
              }
            }
          },
          orderBy: {
            codigo: 'asc'
          }
        },
        repuestos: {
          include: {
            repuesto: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
              }
            }
          }
        },
        _count: {
          select: {
            divisiones: true,
            repuestos: true,
          }
        }
      }
    });

    if (!cajon) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cajón no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: cajon,
    });
  } catch (error) {
    logger.error("Error fetching cajon", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // Check if cajon exists
    const existingCajon = await prisma.cajon.findUnique({
      where: { id },
    });

    if (!existingCajon) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cajón no encontrado" },
        { status: 404 }
      );
    }

    // Validate input data
    const validatedData = CajonUpdateSchema.parse(body);

    // Don't allow changing parent relationships (estanteriaId/armarioId)
    const { estanteriaId, armarioId, ...updateData } = validatedData;

    const updatedCajon = await prisma.cajon.update({
      where: { id },
      data: updateData,
      include: {
        estanteria: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          }
        },
        armario: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          }
        },
        _count: {
          select: {
            divisiones: true,
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedCajon,
    });
  } catch (error) {
    logger.error("Error updating cajon", error);
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Datos inválidos", details: [JSON.stringify((error as any).issues || [])] },
        { status: 400 }
      );
    }
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if cajon exists
    const existingCajon = await prisma.cajon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            divisiones: true,
            repuestos: true,
          }
        }
      }
    });

    if (!existingCajon) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cajón no encontrado" },
        { status: 404 }
      );
    }

    // Check if cajon has divisions or repuestos
    if (existingCajon._count.divisiones > 0 || existingCajon._count.repuestos > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No se puede eliminar el cajón porque contiene divisiones o repuestos asociados. Elimine primero las divisiones y repuestos asociados."
        },
        { status: 409 }
      );
    }

    await prisma.cajon.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Cajón eliminado exitosamente" },
    });
  } catch (error) {
    logger.error("Error deleting cajon", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}