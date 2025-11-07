import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, PaginationParams, EquipoWithRelations, EquipoCreateInput, PaginatedResponse } from "@/types/api";

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
            { sap: { contains: search, mode: "insensitive" as const } },
            { nombre: { contains: search, mode: "insensitive" as const } },
            { descripcion: { contains: search, mode: "insensitive" as const } },
            { marca: { contains: search, mode: "insensitive" as const } },
            { modelo: { contains: search, mode: "insensitive" as const } },
            { numeroSerie: { contains: search, mode: "insensitive" as const } },
          ],
          isActive: true,
        }
      : { isActive: true };

    // Get total count for pagination
    const total = await prisma.equipo.count({ where });

    // Get equipos with relations
    const equipos = await prisma.equipo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
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

    const formattedEquipos: EquipoWithRelations[] = equipos.map((equipo) => ({
      ...equipo,
      createdAt: equipo.createdAt,
      updatedAt: equipo.updatedAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<PaginatedResponse<EquipoWithRelations>>({
      success: true,
      data: formattedEquipos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      message: `${total} equipos found`,
      details: [
        `Page ${page} of ${totalPages}`,
        `${total} total equipos`,
        `Showing ${formattedEquipos.length} resultados`,
      ],
    });
  } catch (error) {
    console.error("Error fetching equipos:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch equipos",
        details: [error instanceof Error ? error.message : "Unknown error"],
      },
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

    const body = await req.json();
    const { repuestos, ...equipoData }: EquipoCreateInput = body;

    // Check for duplicate codigo
    const existingEquipo = await prisma.equipo.findFirst({
      where: {
        OR: [
          { codigo: equipoData.codigo },
          ...(equipoData.sap ? [{ sap: equipoData.sap }] : []),
        ],
      },
    });

    if (existingEquipo) {
      const field = existingEquipo.codigo === equipoData.codigo ? "código" : "SAP";
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Equipo with this ${field} already exists`,
          details: [`El ${field} "${equipoData[field === "código" ? "codigo" : "sap"]}" ya está en uso`],
        },
        { status: 409 }
      );
    }

    // Create equipo with transaction
    const result = await prisma.$transaction(async (tx) => {
      const newEquipo = await tx.equipo.create({
        data: {
          ...equipoData,
          isActive: equipoData.isActive ?? true,
        },
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

      // Create repuestos associations if provided
      if (repuestos && repuestos.length > 0) {
        await tx.repuestoEquipo.createMany({
          data: repuestos.map(({ repuestoId, cantidad }) => ({
            equipoId: newEquipo.id,
            repuestoId,
            cantidad,
          })),
        });

        // Fetch the updated equipo with repuestos
        const updatedEquipo = await tx.equipo.findUnique({
          where: { id: newEquipo.id },
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

        return updatedEquipo;
      }

      return newEquipo;
    });

    if (!result) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Failed to create equipo - no result returned",
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
      message: "Equipo created successfully",
      details: [
        `Código: ${formattedEquipo.codigo}`,
        ...(formattedEquipo.sap ? [`SAP: ${formattedEquipo.sap}`] : []),
        `Repuestos asociados: ${formattedEquipo._count.repuestos}`,
      ],
    });
  } catch (error) {
    console.error("Error creating equipo:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to create equipo",
        details: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}