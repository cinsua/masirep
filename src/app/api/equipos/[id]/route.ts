import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, EquipoWithRelations, EquipoUpdateInput } from "@/types/api";

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

    const equipo = await prisma.equipo.findUnique({
      where: { id },
      include: {
        repuestos: {
          include: {
            repuesto: true,
          },
        },
        _count: {
          select: {
            repuestos: true,
          },
        },
      },
    });

    if (!equipo) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Equipo not found",
          details: [`No equipo found with ID: ${id}`],
        },
        { status: 404 }
      );
    }

    const formattedEquipo: EquipoWithRelations = {
      ...equipo,
      createdAt: equipo.createdAt,
      updatedAt: equipo.updatedAt,
    };

    return NextResponse.json<ApiResponse<EquipoWithRelations>>({
      success: true,
      data: formattedEquipo,
      message: "Equipo retrieved successfully",
      details: [
        `Código: ${formattedEquipo.codigo}`,
        ...(formattedEquipo.sap ? [`SAP: ${formattedEquipo.sap}`] : []),
        `Repuestos asociados: ${formattedEquipo._count.repuestos}`,
      ],
    });
  } catch (error) {
    console.error("Error fetching equipo:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch equipo",
        details: [error instanceof Error ? error.message : "Unknown error"],
      },
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
    const { repuestos, ...equipoData }: EquipoUpdateInput = body;

    // Check if equipo exists
    const existingEquipo = await prisma.equipo.findUnique({
      where: { id },
    });

    if (!existingEquipo) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Equipo not found",
          details: [`No equipo found with ID: ${id}`],
        },
        { status: 404 }
      );
    }

    // Check for duplicate codigo/sap (excluding current equipo)
    const duplicateEquipo = await prisma.equipo.findFirst({
      where: {
        id: { not: id },
        OR: [
          { codigo: equipoData.codigo },
          ...(equipoData.sap ? [{ sap: equipoData.sap }] : []),
        ],
      },
    });

    if (duplicateEquipo) {
      const field = duplicateEquipo.codigo === equipoData.codigo ? "código" : "SAP";
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Equipo with this ${field} already exists`,
          details: [`El ${field} "${equipoData[field === "código" ? "codigo" : "sap"]}" ya está en uso`],
        },
        { status: 409 }
      );
    }

    // Update equipo with transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedEquipo = await tx.equipo.update({
        where: { id },
        data: equipoData,
        include: {
          repuestos: {
            include: {
              repuesto: true,
            },
          },
          _count: {
            select: {
              repuestos: true,
            },
          },
        },
      });

      // Update repuestos associations if provided
      if (repuestos !== undefined) {
        // Remove existing associations
        await tx.repuestoEquipo.deleteMany({
          where: { equipoId: id },
        });

        // Add new associations if provided
        if (repuestos.length > 0) {
          await tx.repuestoEquipo.createMany({
            data: repuestos.map(({ repuestoId, cantidad }) => ({
              equipoId: id,
              repuestoId,
              cantidad,
            })),
          });
        }

        // Fetch the updated equipo with new repuestos
        const refetchedEquipo = await tx.equipo.findUnique({
          where: { id },
          include: {
            repuestos: {
              include: {
                repuesto: true,
              },
            },
            _count: {
              select: {
                repuestos: true,
              },
            },
          },
        });

        return refetchedEquipo;
      }

      return updatedEquipo;
    });

    if (!result) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Failed to update equipo - no result returned",
          details: ["Transaction completed but no data was returned"],
        },
        { status: 500 }
      );
    }

    const formattedEquipo: EquipoWithRelations = {
      ...result,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    return NextResponse.json<ApiResponse<EquipoWithRelations>>({
      success: true,
      data: formattedEquipo,
      message: "Equipo updated successfully",
      details: [
        `Código: ${formattedEquipo.codigo}`,
        ...(formattedEquipo.sap ? [`SAP: ${formattedEquipo.sap}`] : []),
        `Repuestos asociados: ${formattedEquipo._count.repuestos}`,
      ],
    });
  } catch (error) {
    console.error("Error updating equipo:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update equipo",
        details: [error instanceof Error ? error.message : "Unknown error"],
      },
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

    // Check if equipo exists
    const existingEquipo = await prisma.equipo.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            repuestos: true,
          },
        },
      },
    });

    if (!existingEquipo) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Equipo not found",
          details: [`No equipo found with ID: ${id}`],
        },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    const deletedEquipo = await prisma.equipo.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: deletedEquipo.id,
        codigo: deletedEquipo.codigo,
        nombre: deletedEquipo.nombre,
        isActive: deletedEquipo.isActive,
      },
      message: "Equipo deleted successfully",
      details: [
        `Equipo "${deletedEquipo.codigo}" - ${deletedEquipo.nombre} marked as inactive`,
        `Previously had ${existingEquipo._count.repuestos} repuesto associations`,
      ],
    });
  } catch (error) {
    console.error("Error deleting equipo:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to delete equipo",
        details: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}