import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, RepuestoUpdateInput } from "@/types/api";

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
    const repuesto = await prisma.repuesto.findUnique({
      where: { id: params.id, isActive: true },
      include: {
        equipos: {
          include: {
            equipo: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
        ubicaciones: {
          include: {
            armario: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
            estanteria: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
            estante: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
            cajon: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
            division: {
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

    if (!repuesto) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Repuesto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: repuesto,
    });
  } catch (error) {
    console.error("Error fetching repuesto:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const body: RepuestoUpdateInput = await req.json();

    // Check if repuesto exists
    const existingRepuesto = await prisma.repuesto.findUnique({
      where: { id: params.id },
    });

    if (!existingRepuesto) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Repuesto no encontrado" },
        { status: 404 }
      );
    }

    // Check if codigo already exists (if being updated)
    if (body.codigo && body.codigo !== existingRepuesto.codigo) {
      const duplicateRepuesto = await prisma.repuesto.findUnique({
        where: { codigo: body.codigo },
      });

      if (duplicateRepuesto) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "El código ya existe" },
          { status: 409 }
        );
      }
    }

    // Update repuesto with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the repuesto
      const repuesto = await tx.repuesto.update({
        where: { id: params.id },
        data: {
          ...(body.codigo && { codigo: body.codigo }),
          ...(body.nombre && { nombre: body.nombre }),
          ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
          ...(body.marca !== undefined && { marca: body.marca }),
          ...(body.modelo !== undefined && { modelo: body.modelo }),
          ...(body.numeroParte !== undefined && { numeroParte: body.numeroParte }),
          ...(body.stockMinimo !== undefined && { stockMinimo: body.stockMinimo }),
          ...(body.categoria !== undefined && { categoria: body.categoria }),
        },
        include: {
          equipos: {
            include: {
              equipo: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
          ubicaciones: {
            include: {
              armario: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
              estanteria: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
              estante: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
              cajon: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
              division: {
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

      // Update equipment associations if provided
      if (body.equipos !== undefined) {
        // Delete existing associations
        await tx.repuestoEquipo.deleteMany({
          where: { repuestoId: params.id },
        });

        // Create new associations
        if (body.equipos.length > 0) {
          await tx.repuestoEquipo.createMany({
            data: body.equipos.map((equipoId) => ({
              repuestoId: params.id,
              equipoId,
              cantidad: 1,
            })),
          });
        }
      }

      // Update location associations if provided
      if (body.ubicaciones !== undefined) {
        // Delete existing associations
        await tx.repuestoUbicacion.deleteMany({
          where: { repuestoId: params.id },
        });

        // Create new associations
        if (body.ubicaciones.length > 0) {
          const ubicacionData = body.ubicaciones.map((ubicacion) => {
            const baseData = {
              repuestoId: params.id,
              cantidad: ubicacion.cantidad,
            };

            // Add the appropriate location field based on tipo
            switch (ubicacion.tipo) {
              case "armario":
                return { ...baseData, armarioId: ubicacion.id };
              case "estanteria":
                return { ...baseData, estanteriaId: ubicacion.id };
              case "estante":
                return { ...baseData, estanteId: ubicacion.id };
              case "cajon":
                return { ...baseData, cajonId: ubicacion.id };
              case "division":
                return { ...baseData, divisionId: ubicacion.id };
              default:
                throw new Error(`Tipo de ubicación inválido: ${ubicacion.tipo}`);
            }
          });

          await tx.repuestoUbicacion.createMany({
            data: ubicacionData,
          });
        }
      }

      // Update stockActual based on ubicaciones
      const totalStock = await tx.repuestoUbicacion.aggregate({
        where: { repuestoId: params.id },
        _sum: { cantidad: true },
      });

      await tx.repuesto.update({
        where: { id: params.id },
        data: { stockActual: totalStock._sum.cantidad || 0 },
      });

      return repuesto;
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: "Repuesto actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating repuesto:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    // Check if repuesto exists
    const existingRepuesto = await prisma.repuesto.findUnique({
      where: { id: params.id },
      include: {
        ubicaciones: true,
      },
    });

    if (!existingRepuesto) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Repuesto no encontrado" },
        { status: 404 }
      );
    }

    // Check if repuesto has stock in any location
    if (existingRepuesto.stockActual > 0) {
      return NextResponse.json<ApiResponse>(
        { 
          success: false, 
          error: "No se puede eliminar un repuesto con stock existente. Primero debe mover o eliminar el stock de todas las ubicaciones." 
        },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.repuesto.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Repuesto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting repuesto:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}