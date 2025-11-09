import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, PaginationParams, RepuestoWithRelations, RepuestoCreateInput } from "@/types/api";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { codigo: { contains: search, mode: "insensitive" as const } },
            { nombre: { contains: search, mode: "insensitive" as const } },
            { descripcion: { contains: search, mode: "insensitive" as const } },
            { marca: { contains: search, mode: "insensitive" as const } },
            { modelo: { contains: search, mode: "insensitive" as const } },
            { numeroParte: { contains: search, mode: "insensitive" as const } },
            { categoria: { contains: search, mode: "insensitive" as const } },
          ],
          isActive: true,
        }
      : { isActive: true };

    // Get total count for pagination
    const total = await prisma.repuesto.count({ where });

    // Get repuestos with relations
    const repuestos = await prisma.repuesto.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        equipos: {
          where: {
            equipo: { isActive: true },
          },
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

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: repuestos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching repuestos:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: RepuestoCreateInput = await req.json();

    // Validate required fields
    if (!body.codigo || !body.nombre) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Código y nombre son requeridos" },
        { status: 400 }
      );
    }

    // Check if codigo already exists
    const existingRepuesto = await prisma.repuesto.findUnique({
      where: { codigo: body.codigo },
    });

    if (existingRepuesto) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El código ya existe" },
        { status: 409 }
      );
    }

    // Create repuesto with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the repuesto
      const repuesto = await tx.repuesto.create({
        data: {
          codigo: body.codigo,
          nombre: body.nombre,
          descripcion: body.descripcion,
          marca: body.marca,
          modelo: body.modelo,
          numeroParte: body.numeroParte,
          stockMinimo: body.stockMinimo || 0,
          categoria: body.categoria,
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

      // Create equipment associations if provided
      if (body.equipos && body.equipos.length > 0) {
        await tx.repuestoEquipo.createMany({
          data: body.equipos.map((equipoId) => ({
            repuestoId: repuesto.id,
            equipoId,
            cantidad: 1,
          })),
        });
      }

      // Create location associations if provided
      if (body.ubicaciones && body.ubicaciones.length > 0) {
        const ubicacionData = body.ubicaciones.map((ubicacion) => {
          const baseData = {
            repuestoId: repuesto.id,
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

      // Update stockActual based on ubicaciones
      const totalStock = await tx.repuestoUbicacion.aggregate({
        where: { repuestoId: repuesto.id },
        _sum: { cantidad: true },
      });

      await tx.repuesto.update({
        where: { id: repuesto.id },
        data: { stockActual: totalStock._sum.cantidad || 0 },
      });

      return repuesto;
    });

    return NextResponse.json<ApiResponse<RepuestoWithRelations>>(
      {
        success: true,
        data: result,
        message: "Repuesto creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating repuesto:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}