import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";

// GET - Get all ubicaciones for a componente
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if componente exists
    const componente = await prisma.componente.findFirst({
      where: { id: id, isActive: true },
    });

    if (!componente) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Componente no encontrado" },
        { status: 404 }
      );
    }

    // Get all ubicaciones for the componente
    const ubicaciones = await prisma.componenteUbicacion.findMany({
      where: { componenteId: id },
      include: {
        cajoncito: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            organizador: {
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ubicaciones,
    });
  } catch (error) {
    console.error("Error fetching componente ubicaciones:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add ubicaciones to a componente
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { cajoncitoId, cantidad } = body;

    // Validate required fields
    if (!cajoncitoId || !cantidad || cantidad <= 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "CajoncitoId y cantidad son requeridos, cantidad debe ser mayor a 0" },
        { status: 400 }
      );
    }

    // Check if componente exists
    const componente = await prisma.componente.findFirst({
      where: { id: id, isActive: true },
    });

    if (!componente) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Componente no encontrado" },
        { status: 404 }
      );
    }

    // Check if cajoncito exists
    const cajoncito = await prisma.cajoncito.findUnique({
      where: { id: cajoncitoId },
    });

    if (!cajoncito) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cajoncito no encontrado" },
        { status: 404 }
      );
    }

    // Check if this association already exists
    const existingAssociation = await prisma.componenteUbicacion.findUnique({
      where: {
        componenteId_cajoncitoId: {
          componenteId: id,
          cajoncitoId: cajoncitoId,
        },
      },
    });

    if (existingAssociation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El componente ya está asociado a este cajoncito" },
        { status: 409 }
      );
    }

    // Create the association
    const result = await prisma.$transaction(async (tx) => {
      const ubicacion = await tx.componenteUbicacion.create({
        data: {
          componenteId: id,
          cajoncitoId: cajoncitoId,
          cantidad: cantidad,
        },
        include: {
          cajoncito: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              organizador: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
        },
      });

      return ubicacion;
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: "Ubicación agregada exitosamente",
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding componente ubicacion:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}