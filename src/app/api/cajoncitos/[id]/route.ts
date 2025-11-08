import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { CajoncitoUpdateSchema } from "@/lib/validations/organizador";
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

    const cajoncito = await prisma.cajoncito.findUnique({
      where: { id },
      include: {
        organizador: {
          include: {
            estanteria: {
              include: {
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
              include: {
                ubicacion: {
                  select: {
                    id: true,
                    codigo: true,
                    nombre: true,
                  }
                }
              }
            }
          }
        },
        componentes: {
          include: {
            componente: {
              select: {
                id: true,
                categoria: true,
                descripcion: true,
                valorUnidad: true,
                stockMinimo: true,
              }
            }
          }
        },
        _count: {
          select: {
            componentes: true,
          }
        }
      }
    });

    if (!cajoncito) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cajoncito no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: cajoncito,
    });
  } catch (error) {
    logger.error("Error fetching cajoncito", error);
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

    // Check if cajoncito exists
    const existingCajoncito = await prisma.cajoncito.findUnique({
      where: { id },
    });

    if (!existingCajoncito) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cajoncito no encontrado" },
        { status: 404 }
      );
    }

    // Validate input data
    const validatedData = CajoncitoUpdateSchema.parse(body);

    // Don't allow changing parent relationship (organizadorId)
    const { organizadorId, ...updateData } = validatedData;

    const updatedCajoncito = await prisma.cajoncito.update({
      where: { id },
      data: updateData,
      include: {
        organizador: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          }
        },
        _count: {
          select: {
            componentes: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedCajoncito,
    });
  } catch (error) {
    logger.error("Error updating cajoncito", error);
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

    // Check if cajoncito exists
    const existingCajoncito = await prisma.cajoncito.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            componentes: true,
          }
        }
      }
    });

    if (!existingCajoncito) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cajoncito no encontrado" },
        { status: 404 }
      );
    }

    // Check if cajoncito has componentes
    if (existingCajoncito._count.componentes > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No se puede eliminar el cajoncito porque contiene componentes asociados. Elimine primero los componentes asociados."
        },
        { status: 409 }
      );
    }

    await prisma.cajoncito.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Cajoncito eliminado exitosamente" },
    });
  } catch (error) {
    logger.error("Error deleting cajoncito", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}