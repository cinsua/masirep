import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { DivisionUpdateSchema } from "@/lib/validations/cajon";
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

    const division = await prisma.division.findUnique({
      where: { id },
      include: {
        cajon: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
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
            }
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
            repuestos: true,
          }
        }
      }
    });

    if (!division) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "División no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: division,
    });
  } catch (error) {
    logger.error("Error fetching division", error);
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

    // Check if division exists
    const existingDivision = await prisma.division.findUnique({
      where: { id },
    });

    if (!existingDivision) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "División no encontrada" },
        { status: 404 }
      );
    }

    // Validate input data
    const validatedData = DivisionUpdateSchema.parse(body);

    // Don't allow changing parent cajon
    const { cajonId, ...updateData } = validatedData;

    const updatedDivision = await prisma.division.update({
      where: { id },
      data: updateData,
      include: {
        cajon: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          }
        },
        _count: {
          select: {
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedDivision,
    });
  } catch (error) {
    logger.error("Error updating division", error);
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

    // Check if division exists
    const existingDivision = await prisma.division.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            repuestos: true,
          }
        }
      }
    });

    if (!existingDivision) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "División no encontrada" },
        { status: 404 }
      );
    }

    // Check if division has repuestos
    if (existingDivision._count.repuestos > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No se puede eliminar la división porque contiene repuestos asociados. Elimine primero los repuestos asociados."
        },
        { status: 409 }
      );
    }

    await prisma.division.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "División eliminada exitosamente" },
    });
  } catch (error) {
    logger.error("Error deleting division", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}