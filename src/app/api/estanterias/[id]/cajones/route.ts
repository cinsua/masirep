import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { CajonSchema } from "@/lib/validations/cajon";

interface Params {
  params: Promise<{ id: string }>;
}

// Helper function to generate auto-numbered code
async function generateCajonCode(estanteriaId: string): Promise<string> {
  const lastCajon = await prisma.cajon.findFirst({
    where: { estanteriaId },
    orderBy: { codigo: 'desc' },
  });

  if (!lastCajon) {
    return "CAJ-001";
  }

  // Extract number from code like "CAJ-001" and increment
  const match = lastCajon.codigo.match(/CAJ-(\d{3})$/);
  if (match) {
    const nextNumber = parseInt(match[1]) + 1;
    return `CAJ-${nextNumber.toString().padStart(3, '0')}`;
  }

  // If no match, start with CAJ-001
  return "CAJ-001";
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

    // Check if estanteria exists
    const estanteria = await prisma.estanteria.findUnique({
      where: { id },
    });

    if (!estanteria) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Estantería no encontrada" },
        { status: 404 }
      );
    }

    const where = {
      estanteriaId: id,
      ...(search && {
        OR: [
          { codigo: { contains: search, mode: "insensitive" as const } },
          { nombre: { contains: search, mode: "insensitive" as const } },
          { descripcion: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const cajones = await prisma.cajon.findMany({
      where,
      orderBy: { codigo: 'asc' },
      include: {
        _count: {
          select: {
            divisiones: true,
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        cajones,
        estanteria: {
          id: estanteria.id,
          codigo: estanteria.codigo,
          nombre: estanteria.nombre,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching cajones:", error);
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

    // Check if estanteria exists
    const estanteria = await prisma.estanteria.findUnique({
      where: { id },
    });

    if (!estanteria) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Estantería no encontrada" },
        { status: 404 }
      );
    }

    // Generate auto-numbered code
    const autoCode = await generateCajonCode(id);

    // Validate input data
    const validatedData = CajonSchema.parse({
      ...body,
      codigo: autoCode, // Override with auto-generated code
      estanteriaId: id,
      armarioId: undefined // Ensure armarioId is null for estanteria cajones
    });

    // Check if codigo already exists
    const existingCajon = await prisma.cajon.findUnique({
      where: { codigo: validatedData.codigo },
    });

    if (existingCajon) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El código de cajón ya existe" },
        { status: 409 }
      );
    }

    const cajon = await prisma.cajon.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            divisiones: true,
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: cajon,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating cajon:", error);
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