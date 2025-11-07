import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { validateComponente } from "@/lib/validations/componente";

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

    const componente = await prisma.componente.findFirst({
      where: { id: id, isActive: true },
      include: {
        ubicaciones: {
          include: {
            cajoncito: {
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

    if (!componente) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Componente no encontrado" },
        { status: 404 }
      );
    }

    // Compute stockActual for response and cast valorUnidad
    const componenteWithStock = {
      ...componente,
      valorUnidad: componente.valorUnidad as Array<{ valor: string; unidad: string }>,
      stockActual: componente.ubicaciones.reduce(
        (total, ubicacion) => total + ubicacion.cantidad,
        0
      ),
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: componenteWithStock,
    });
  } catch (error) {
    console.error("Error fetching componente:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Validate using Zod schema
    const validation = validateComponente(body, true);

    if (!validation.isValid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Datos inválidos",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Check if componente exists
    const existingComponente = await prisma.componente.findFirst({
      where: { id: id, isActive: true },
    });

    if (!existingComponente) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Componente no encontrado" },
        { status: 404 }
      );
    }

    // Update componente with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the componente
      const componente = await tx.componente.update({
        where: { id: id },
        data: {
          ...(body.categoria && { categoria: body.categoria }),
          ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
          ...(body.valorUnidad !== undefined && { valorUnidad: body.valorUnidad }),
          ...(body.stockMinimo !== undefined && { stockMinimo: body.stockMinimo }),
        },
        include: {
          ubicaciones: {
            include: {
              cajoncito: {
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

      return componente;
    });

    // Compute stockActual for response and cast valorUnidad
    const resultWithStock = {
      ...result,
      valorUnidad: result.valorUnidad as Array<{ valor: string; unidad: string }>,
      stockActual: result.ubicaciones.reduce(
        (total, ubicacion) => total + ubicacion.cantidad,
        0
      ),
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: resultWithStock,
      message: "Componente actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating componente:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const existingComponente = await prisma.componente.findFirst({
      where: { id: id, isActive: true },
    });

    if (!existingComponente) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Componente no encontrado" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.componente.update({
      where: { id: id },
      data: { isActive: false },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Componente eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting componente:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}