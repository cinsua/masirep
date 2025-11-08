import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { CajoncitoSchema } from "@/lib/validations/organizador";

interface Params {
  params: Promise<{ id: string }>;
}

// Helper function to generate auto-numbered code
async function generateCajoncitoCode(organizadorId: string): Promise<string> {
  const lastCajoncito = await prisma.cajoncito.findFirst({
    where: { organizadorId },
    orderBy: { codigo: 'desc' },
  });

  if (!lastCajoncito) {
    return "CAJ-001";
  }

  // Extract number from code like "CAJ-001" and increment
  const match = lastCajoncito.codigo.match(/CAJ-(\d{3})$/);
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

    // Check if organizador exists
    const organizador = await prisma.organizador.findUnique({
      where: { id },
    });

    if (!organizador) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Organizador no encontrado" },
        { status: 404 }
      );
    }

    const where = {
      organizadorId: id,
      ...(search && {
        OR: [
          { codigo: { contains: search, mode: "insensitive" as const } },
          { nombre: { contains: search, mode: "insensitive" as const } },
          { descripcion: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const cajoncitos = await prisma.cajoncito.findMany({
      where,
      orderBy: { codigo: 'asc' },
      include: {
        _count: {
          select: {
            componentes: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        cajoncitos,
        organizador: {
          id: organizador.id,
          codigo: organizador.codigo,
          nombre: organizador.nombre,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching cajoncitos:", error);
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

    // Check if organizador exists
    const organizador = await prisma.organizador.findUnique({
      where: { id },
    });

    if (!organizador) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Organizador no encontrado" },
        { status: 404 }
      );
    }

    // Check business rule: max 50 cajoncitos per organizador
    const cajoncitoCount = await prisma.cajoncito.count({
      where: { organizadorId: id },
    });

    if (cajoncitoCount >= 50) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No se pueden crear más de 50 cajoncitos por organizador" },
        { status: 409 }
      );
    }

    // Generate auto-numbered code
    const autoCode = await generateCajoncitoCode(id);

    // Validate input data
    const validatedData = CajoncitoSchema.parse({
      ...body,
      codigo: autoCode, // Override with auto-generated code
      organizadorId: id,
    });

    // Check if codigo already exists
    const existingCajoncito = await prisma.cajoncito.findUnique({
      where: { codigo: validatedData.codigo },
    });

    if (existingCajoncito) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El código de cajoncito ya existe" },
        { status: 409 }
      );
    }

    const cajoncito = await prisma.cajoncito.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            componentes: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: cajoncito,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating cajoncito:", error);
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