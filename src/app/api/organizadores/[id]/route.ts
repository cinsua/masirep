import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { OrganizadorUpdateSchema } from "@/lib/validations/organizador";
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

    const organizador = await prisma.organizador.findUnique({
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
        cajoncitos: {
          include: {
            _count: {
              select: {
                componentes: true,
              }
            }
          },
          orderBy: {
            codigo: 'asc'
          }
        },
        _count: {
          select: {
            cajoncitos: true,
          }
        }
      }
    });

    if (!organizador) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Organizador no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: organizador,
    });
  } catch (error) {
    logger.error("Error fetching organizador", error);
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

    // Check if organizador exists
    const existingOrganizador = await prisma.organizador.findUnique({
      where: { id },
    });

    if (!existingOrganizador) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Organizador no encontrado" },
        { status: 404 }
      );
    }

    // Validate input data
    const validatedData = OrganizadorUpdateSchema.parse(body);

    // Don't allow changing parent relationships (estanteriaId/armarioId)
    const { estanteriaId, armarioId, ...updateData } = validatedData;

    const updatedOrganizador = await prisma.organizador.update({
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
            cajoncitos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedOrganizador,
    });
  } catch (error) {
    logger.error("Error updating organizador", error);
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

    // Check if organizador exists
    const existingOrganizador = await prisma.organizador.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cajoncitos: true,
          }
        }
      }
    });

    if (!existingOrganizador) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Organizador no encontrado" },
        { status: 404 }
      );
    }

    // Check if organizador has cajoncitos
    if (existingOrganizador._count.cajoncitos > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No se puede eliminar el organizador porque contiene cajoncitos asociados. Elimine primero los cajoncitos asociados."
        },
        { status: 409 }
      );
    }

    await prisma.organizador.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Organizador eliminado exitosamente" },
    });
  } catch (error) {
    logger.error("Error deleting organizador", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}