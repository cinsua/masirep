import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { EstanteriaSchema } from "@/lib/validations/ubicacion";

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
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

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

    const where = {
      ubicacionId: id,
      ...(search && {
        OR: [
          { codigo: { contains: search, mode: "insensitive" as const } },
          { nombre: { contains: search, mode: "insensitive" as const } },
          { descripcion: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const estanterias = await prisma.estanteria.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: {
            cajones: true,
            estantes: true,
            organizadores: true,
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        estanterias,
        ubicacion: {
          id: ubicacion.id,
          codigo: ubicacion.codigo,
          nombre: ubicacion.nombre,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching estanterias:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Params) {
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
    const validatedData = EstanteriaSchema.parse({ ...body, ubicacionId: id });

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

    // Check if codigo already exists
    const existingEstanteria = await prisma.estanteria.findUnique({
      where: { codigo: validatedData.codigo },
    });

    if (existingEstanteria) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El código de estantería ya existe" },
        { status: 409 }
      );
    }

    const estanteria = await prisma.estanteria.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            cajones: true,
            estantes: true,
            organizadores: true,
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: estanteria,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating estanteria:", error);
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Datos inválidos", details: JSON.stringify((error as any).issues) },
        { status: 400 }
      );
    }
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}