import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import {
  UbicacionSchema,
  UbicacionSearchParamsSchema,
  UbicacionFormData,
  UbicacionUpdateFormData
} from "@/lib/validations/ubicacion";

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
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";

    // If requesting specific type (legacy support)
    if (type && type !== "ubicacion") {
      let data: unknown[] = [];

      // Build where clause for search
      const where = search
        ? {
            OR: [
              { codigo: { contains: search, mode: "insensitive" as const } },
              { nombre: { contains: search, mode: "insensitive" as const } },
              { descripcion: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      // Fetch based on type
      switch (type) {
        case "armario":
          data = await prisma.armario.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        case "estanteria":
          data = await prisma.estanteria.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        case "estante":
          data = await prisma.estante.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        case "cajon":
          data = await prisma.cajon.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        case "division":
          data = await prisma.division.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        case "cajoncito":
          data = await prisma.cajoncito.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        default:
          // Return all types if no specific type
          const [armarios, estanterias, estantes, cajones, divisiones, cajoncitos] = await Promise.all([
            prisma.armario.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
            prisma.estanteria.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
            prisma.estante.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
            prisma.cajon.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
            prisma.division.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
            prisma.cajoncito.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
          ]);

          data = [
            ...armarios.map(item => ({ ...item, type: 'armario' })),
            ...estanterias.map(item => ({ ...item, type: 'estanteria' })),
            ...estantes.map(item => ({ ...item, type: 'estante' })),
            ...cajones.map(item => ({ ...item, type: 'cajon' })),
            ...divisiones.map(item => ({ ...item, type: 'division' })),
            ...cajoncitos.map(item => ({ ...item, type: 'cajoncito' })),
          ];
          break;
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        data,
      });
    }

    // Enhanced ubicaciones endpoint with pagination and search
    const searchParamsParsed = UbicacionSearchParamsSchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const where = {
      ...(searchParamsParsed.search && {
        OR: [
          { codigo: { contains: searchParamsParsed.search, mode: "insensitive" as const } },
          { nombre: { contains: searchParamsParsed.search, mode: "insensitive" as const } },
          { descripcion: { contains: searchParamsParsed.search, mode: "insensitive" as const } },
        ],
      }),
      ...(searchParamsParsed.isActive !== undefined && {
        isActive: searchParamsParsed.isActive,
      }),
    };

    const [ubicaciones, total] = await Promise.all([
      prisma.ubicacion.findMany({
        where,
        orderBy: { [searchParamsParsed.sortBy]: searchParamsParsed.sortOrder },
        skip: (searchParamsParsed.page - 1) * searchParamsParsed.limit,
        take: searchParamsParsed.limit,
        include: {
          _count: {
            select: {
              armarios: true,
              estanterias: true,
            }
          }
        }
      }),
      prisma.ubicacion.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ubicaciones,
        pagination: {
          page: searchParamsParsed.page,
          limit: searchParamsParsed.limit,
          total,
          pages: Math.ceil(total / searchParamsParsed.limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching ubicaciones:", error);
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

    const body: UbicacionFormData = await req.json();
    const validatedData = UbicacionSchema.parse(body);

    // Check if codigo already exists
    const existingUbicacion = await prisma.ubicacion.findUnique({
      where: { codigo: validatedData.codigo },
    });

    if (existingUbicacion) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El código de ubicación ya existe" },
        { status: 409 }
      );
    }

    const ubicacion = await prisma.ubicacion.create({
      data: validatedData,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ubicacion,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating ubicacion:", error);
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