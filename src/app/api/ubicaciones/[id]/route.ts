import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { UbicacionUpdateSchema } from "@/lib/validations/ubicacion";

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

    const ubicacion = await prisma.ubicacion.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            armarios: true,
            estanterias: true,
          }
        }
      }
    });

    if (!ubicacion) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Ubicación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ubicacion,
    });
  } catch (error) {
    console.error("Error fetching ubicacion:", error);
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
    const validatedData = UbicacionUpdateSchema.parse(body);

    // Check if ubicacion exists
    const existingUbicacion = await prisma.ubicacion.findUnique({
      where: { id },
    });

    if (!existingUbicacion) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Ubicación no encontrada" },
        { status: 404 }
      );
    }

    // Check if new codigo already exists (if being updated)
    if (validatedData.codigo && validatedData.codigo !== existingUbicacion.codigo) {
      const codigoExists = await prisma.ubicacion.findUnique({
        where: { codigo: validatedData.codigo },
      });

      if (codigoExists) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "El código de ubicación ya existe" },
          { status: 409 }
        );
      }
    }

    const ubicacion = await prisma.ubicacion.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            armarios: true,
            estanterias: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ubicacion,
    });
  } catch (error) {
    console.error("Error updating ubicacion:", error);
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

    // Check if ubicacion exists
    const existingUbicacion = await prisma.ubicacion.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            armarios: true,
            estanterias: true,
          }
        }
      }
    });

    if (!existingUbicacion) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Ubicación no encontrada" },
        { status: 404 }
      );
    }

    // Check if ubicacion has child entities
    if (existingUbicacion._count.armarios > 0 || existingUbicacion._count.estanterias > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No se puede eliminar la ubicación porque tiene armarios o estanterías asociadas"
        },
        { status: 409 }
      );
    }

    await prisma.ubicacion.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Ubicación eliminada exitosamente" },
    });
  } catch (error) {
    console.error("Error deleting ubicacion:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}