import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { ArmarioSchema } from "@/lib/validations/ubicacion";

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

    const armarios = await prisma.armario.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: {
            cajones: true,
            organizadores: true,
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        armarios,
        ubicacion: {
          id: ubicacion.id,
          codigo: ubicacion.codigo,
          nombre: ubicacion.nombre,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching armarios:", error);
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
    const validatedData = ArmarioSchema.parse({ ...body, ubicacionId: id });

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
    const existingArmario = await prisma.armario.findUnique({
      where: { codigo: validatedData.codigo },
    });

    if (existingArmario) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El código de armario ya existe" },
        { status: 409 }
      );
    }

    const armario = await prisma.armario.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            cajones: true,
            organizadores: true,
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: armario,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating armario:", error);
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