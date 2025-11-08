import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import {
  updateQuantitySchema,
  associationParamsSchema
} from "@/lib/validations/associacion";

// PUT - Update quantity of a repuesto-ubicacion association
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; assocId: string }> }
) {
  const { id, assocId } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate route parameters
    const routeValidation = associationParamsSchema.safeParse({ id, assocId });
    if (!routeValidation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Parámetros inválidos" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate request body
    const validation = updateQuantitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Datos inválidos",
          details: validation.error.issues.map(err => err.message)
        },
        { status: 400 }
      );
    }

    const { cantidad } = validation.data;

    // Check if the association exists and belongs to the specified repuesto
    const existingAssociation = await prisma.repuestoUbicacion.findFirst({
      where: {
        id: assocId,
        repuestoId: id,
      },
    });

    if (!existingAssociation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Asociación no encontrada" },
        { status: 404 }
      );
    }

    // Update the association quantity
    const result = await prisma.$transaction(async (tx) => {
      const updatedAssociation = await tx.repuestoUbicacion.update({
        where: { id: assocId },
        data: { cantidad },
        include: {
          armario: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              ubicacion: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
          estanteria: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              ubicacion: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
          estante: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              estanteria: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                  ubicacion: {
                    select: {
                      id: true,
                      nombre: true,
                      codigo: true,
                    },
                  },
                },
              },
            },
          },
          cajon: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              armario: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                  ubicacion: {
                    select: {
                      id: true,
                      nombre: true,
                      codigo: true,
                    },
                  },
                },
              },
              estanteria: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                  ubicacion: {
                    select: {
                      id: true,
                      nombre: true,
                      codigo: true,
                    },
                  },
                },
              },
            },
          },
          division: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              cajon: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                  armario: {
                    select: {
                      id: true,
                      nombre: true,
                      codigo: true,
                      ubicacion: {
                        select: {
                          id: true,
                          nombre: true,
                          codigo: true,
                        },
                      },
                    },
                  },
                  estanteria: {
                    select: {
                      id: true,
                      nombre: true,
                      codigo: true,
                      ubicacion: {
                        select: {
                          id: true,
                          nombre: true,
                          codigo: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return updatedAssociation;
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: "Cantidad actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error updating repuesto ubicacion:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a repuesto-ubicacion association
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; assocId: string }> }
) {
  const { id, assocId } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate route parameters
    const routeValidation = associationParamsSchema.safeParse({ id, assocId });
    if (!routeValidation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Parámetros inválidos" },
        { status: 400 }
      );
    }

    // Check if the association exists and belongs to the specified repuesto
    const existingAssociation = await prisma.repuestoUbicacion.findFirst({
      where: {
        id: assocId,
        repuestoId: id,
      },
    });

    if (!existingAssociation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Asociación no encontrada" },
        { status: 404 }
      );
    }

    // Delete the association
    await prisma.$transaction(async (tx) => {
      await tx.repuestoUbicacion.delete({
        where: { id: assocId },
      });
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Asociación eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting repuesto ubicacion:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}