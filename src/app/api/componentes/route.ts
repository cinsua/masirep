import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, ComponenteWithRelations } from "@/types/api";
import { validateComponente } from "@/lib/validations/componente";

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
    const categoria = searchParams.get("categoria") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause for search and filtering
    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { descripcion: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (categoria) {
      where.categoria = categoria;
    }

    // Get total count for pagination
    const total = await prisma.componente.count({ where });

    // Get componentes with relations and computed stock
    const componentes = await prisma.componente.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
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

    // Compute stockActual for each componente and cast valorUnidad
    const componentesWithStock = componentes.map((componente) => ({
      ...componente,
      valorUnidad: componente.valorUnidad as Array<{ valor: string; unidad: string }>,
      stockActual: componente.ubicaciones.reduce(
        (total, ubicacion) => total + ubicacion.cantidad,
        0
      ),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: componentesWithStock,
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
    console.error("Error fetching componentes:", error);
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

    const body = await req.json();

    // Validate using Zod schema
    const validation = validateComponente(body, false);

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

    // Create componente with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the componente
      const componente = await tx.componente.create({
        data: {
          categoria: body.categoria,
          descripcion: body.descripcion,
          valorUnidad: body.valorUnidad,
          stockMinimo: body.stockMinimo || 0,
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

      // Create location associations if provided
      if (body.ubicaciones && body.ubicaciones.length > 0) {
        const ubicacionData = body.ubicaciones.map((ubicacion: any) => ({
          componenteId: componente.id,
          cajoncitoId: ubicacion.cajoncitoId,
          cantidad: ubicacion.cantidad,
        }));

        await tx.componenteUbicacion.createMany({
          data: ubicacionData,
        });

        // Update the componente with the new ubicaciones
        componente.ubicaciones = await tx.componenteUbicacion.findMany({
          where: { componenteId: componente.id },
          include: {
            cajoncito: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        });
      }

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

    return NextResponse.json<ApiResponse<ComponenteWithRelations>>(
      {
        success: true,
        data: resultWithStock,
        message: "Componente creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating componente:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}