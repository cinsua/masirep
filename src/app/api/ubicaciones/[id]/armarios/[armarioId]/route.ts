import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { ArmarioSchema } from "@/lib/validations/ubicacion";

interface Params {
  params: Promise<{ id: string; armarioId: string }>;
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

    const { id, armarioId } = await params;
    const body = await req.json();
    const validatedData = ArmarioSchema.parse({ ...body, ubicacionId: id });

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

    // Check if armario exists and belongs to the ubicacion
    const existingArmario = await prisma.armario.findFirst({
      where: {
        id: armarioId,
        ubicacionId: id,
      },
    });

    if (!existingArmario) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Armario no encontrado" },
        { status: 404 }
      );
    }

    // Check if codigo already exists (excluding current armario)
    const duplicateArmario = await prisma.armario.findFirst({
      where: {
        codigo: validatedData.codigo,
        ubicacionId: id,
        id: { not: armarioId },
      },
    });

    if (duplicateArmario) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El código de armario ya existe en esta ubicación" },
        { status: 409 }
      );
    }

    const armario = await prisma.armario.update({
      where: { id: armarioId },
      data: validatedData,
      include: {
        _count: {
          select: {
            cajones: true,
            organizadores: true,
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: armario,
    });
  } catch (error) {
    console.error("Error updating armario:", error);
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

    const { id, armarioId } = await params;

    // Check if armario exists and belongs to the ubicacion
    const armario = await prisma.armario.findFirst({
      where: {
        id: armarioId,
        ubicacionId: id,
      },
      include: {
        _count: {
          select: {
            cajones: true,
            organizadores: true,
            repuestos: true,
          }
        }
      }
    });

    if (!armario) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Armario no encontrado" },
        { status: 404 }
      );
    }

    // Check if armario has content
    if (armario._count.cajones > 0 || armario._count.organizadores > 0 || armario._count.repuestos > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No se puede eliminar el armario porque contiene cajones, organizadores o repuestos asociados" },
        { status: 409 }
      );
    }

    await prisma.armario.delete({
      where: { id: armarioId },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Armario eliminado exitosamente" },
    });
  } catch (error) {
    console.error("Error deleting armario:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}