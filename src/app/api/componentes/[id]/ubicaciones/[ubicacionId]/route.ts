import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";

// DELETE - Remove a specific ubicacion from a componente
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ubicacionId: string }> }
) {
  const { id, ubicacionId } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if the association exists
    const existingAssociation = await prisma.componenteUbicacion.findUnique({
      where: {
        id: ubicacionId,
        componenteId: id,
      },
    });

    if (!existingAssociation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Asociación de ubicación no encontrada" },
        { status: 404 }
      );
    }

    // Delete the association
    await prisma.componenteUbicacion.delete({
      where: { id: ubicacionId },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Ubicación eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error removing componente ubicacion:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update quantity for a specific ubicacion
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ubicacionId: string }> }
) {
  const { id, ubicacionId } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { cantidad } = body;

    // Validate cantidad
    if (cantidad === undefined || cantidad <= 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cantidad es requerida y debe ser mayor a 0" },
        { status: 400 }
      );
    }

    // Check if the association exists
    const existingAssociation = await prisma.componenteUbicacion.findUnique({
      where: {
        id: ubicacionId,
        componenteId: id,
      },
    });

    if (!existingAssociation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Asociación de ubicación no encontrada" },
        { status: 404 }
      );
    }

    // Update the quantity
    const result = await prisma.componenteUbicacion.update({
      where: { id: ubicacionId },
      data: { cantidad: cantidad },
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

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: "Cantidad actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error updating componente ubicacion:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}