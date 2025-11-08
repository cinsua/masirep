import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { OrganizadorSchema } from "@/lib/validations/organizador";

interface Params {
  params: Promise<{ id: string }>;
}

// Helper function to generate auto-numbered code
async function generateOrganizadorCode(estanteriaId: string): Promise<string> {
  const lastOrganizador = await prisma.organizador.findFirst({
    where: { estanteriaId },
    orderBy: { codigo: 'desc' },
  });

  if (!lastOrganizador) {
    return "ORG-001";
  }

  // Extract number from code like "ORG-001" and increment
  const match = lastOrganizador.codigo.match(/ORG-(\d{3})$/);
  if (match) {
    const nextNumber = parseInt(match[1]) + 1;
    return `ORG-${nextNumber.toString().padStart(3, '0')}`;
  }

  // If no match, start with ORG-001
  return "ORG-001";
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

    const organizadores = await prisma.organizador.findMany({
      where,
      orderBy: { codigo: 'asc' },
      include: {
        _count: {
          select: {
            cajoncitos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        organizadores,
        estanteria: {
          id: estanteria.id,
          codigo: estanteria.codigo,
          nombre: estanteria.nombre,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching organizadores:", error);
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
    const autoCode = await generateOrganizadorCode(id);

    // Validate input data
    const validatedData = OrganizadorSchema.parse({
      ...body,
      codigo: autoCode, // Override with auto-generated code
      estanteriaId: id,
      armarioId: undefined // Ensure armarioId is null for estanteria organizadores
    });

    // Check if codigo already exists
    const existingOrganizador = await prisma.organizador.findUnique({
      where: { codigo: validatedData.codigo },
    });

    if (existingOrganizador) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El código de organizador ya existe" },
        { status: 409 }
      );
    }

    const organizador = await prisma.organizador.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            cajoncitos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: organizador,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating organizador:", error);
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