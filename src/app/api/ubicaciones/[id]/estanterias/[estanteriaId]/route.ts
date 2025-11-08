import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { EstanteriaSchema } from "@/lib/validations/ubicacion";

interface Params {
  params: Promise<{ id: string; estanteriaId: string }>;
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

    const { id, estanteriaId } = await params;
    const body = await req.json();
    const validatedData = EstanteriaSchema.parse({ ...body, ubicacionId: id });

    // Check if ubicacion exists
    const ubicacion = await prisma.ubicacion.findUnique({
      where: { id },
    });

    if (!ubicacion) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Ubicación no encontrada" },
        { status: 404 }
      );
    }

    // Check if estanteria exists and belongs to the ubicacion
    const existingEstanteria = await prisma.estanteria.findFirst({
      where: {
        id: estanteriaId,
        ubicacionId: id,
      },
    });

    if (!existingEstanteria) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Estantería no encontrada" },
        { status: 404 }
      );
    }

    // Check if codigo already exists (excluding current estanteria)
    const duplicateEstanteria = await prisma.estanteria.findFirst({
      where: {
        codigo: validatedData.codigo,
        ubicacionId: id,
        id: { not: estanteriaId },
      },
    });

    if (duplicateEstanteria) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El código de estantería ya existe en esta ubicación" },
        { status: 409 }
      );
    }

    const estanteria = await prisma.estanteria.update({
      where: { id: estanteriaId },
      data: validatedData,
      include: {
        _count: {
          select: {
            cajones: true,
            estantes: true,
            organizadores: true,
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: estanteria,
    });
  } catch (error) {
    console.error("Error updating estanteria:", error);
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

    const { id, estanteriaId } = await params;

    // Check if estanteria exists and belongs to the ubicacion
    const estanteria = await prisma.estanteria.findFirst({
      where: {
        id: estanteriaId,
        ubicacionId: id,
      },
      include: {
        _count: {
          select: {
            cajones: true,
            estantes: true,
            organizadores: true,
            repuestos: true,
          }
        }
      }
    });

    if (!estanteria) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Estantería no encontrada" },
        { status: 404 }
      );
    }

    // Check if estanteria has content
    if (estanteria._count.cajones > 0 || estanteria._count.estantes > 0 || estanteria._count.organizadores > 0 || estanteria._count.repuestos > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No se puede eliminar la estantería porque contiene cajones, estantes, organizadores o repuestos asociados" },
        { status: 409 }
      );
    }

    await prisma.estanteria.delete({
      where: { id: estanteriaId },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Estantería eliminada exitosamente" },
    });
  } catch (error) {
    console.error("Error deleting estanteria:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}