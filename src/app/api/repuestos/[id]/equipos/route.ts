import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";

// GET /api/repuestos/[id]/equipos - Get equipos associated with a repuesto
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const equipos = await prisma.repuestoEquipo.findMany({
      where: { repuestoId: params.id },
      include: {
        equipo: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            descripcion: true,
            marca: true,
            modelo: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: equipos,
    });
  } catch (error) {
    console.error("Error fetching repuesto equipos:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/repuestos/[id]/equipos - Associate equipos with a repuesto
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { equipoIds } = await req.json();

    if (!equipoIds || !Array.isArray(equipoIds) || equipoIds.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "equipoIds array is required" },
        { status: 400 }
      );
    }

    // Check if repuesto exists
    const repuesto = await prisma.repuesto.findUnique({
      where: { id: params.id },
    });

    if (!repuesto) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Repuesto not found" },
        { status: 404 }
      );
    }

    // Create technical associations
    const associations: any[] = [];
    for (const equipoId of equipoIds) {
      try {
        const association = await prisma.repuestoEquipo.create({
          data: {
            repuestoId: params.id,
            equipoId,
          },
        });
        associations.push(association);
      } catch (error: any) {
        // Ignore unique constraint violations - association already exists
        if (error.code !== 'P2002') {
          throw error;
        }
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { count: associations.length },
      message: "Equipos associated successfully",
    });
  } catch (error) {
    console.error("Error associating equipos:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/repuestos/[id]/equipos - Remove equipment association
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { equipoIds } = await req.json();

    if (!equipoIds || !Array.isArray(equipoIds) || equipoIds.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "equipoIds array is required" },
        { status: 400 }
      );
    }

    // Remove associations
    const result = await prisma.repuestoEquipo.deleteMany({
      where: {
        repuestoId: params.id,
        equipoId: { in: equipoIds },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { count: result.count },
      message: "Equipment associations removed successfully",
    });
  } catch (error) {
    console.error("Error removing equipment associations:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}