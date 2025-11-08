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
async function generateOrganizadorCode(armarioId: string): Promise<string> {
  const lastOrganizador = await prisma.organizador.findFirst({
    where: { armarioId },
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

// Helper function to generate cajoncito code
function generateCajoncitoCode(index: number): string {
  return `CAJ-${index.toString().padStart(3, '0')}`;
}

// Helper function to create cajoncitos for an organizador
async function createCajoncitosForOrganizador(organizadorId: string, cantidad: number): Promise<void> {
  const cajoncitos = Array.from({ length: cantidad }, (_, index) => ({
    codigo: generateCajoncitoCode(index + 1),
    nombre: `Cajoncito ${index + 1}`,
    organizadorId,
  }));

  await prisma.cajoncito.createMany({
    data: cajoncitos,
  });
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

    // Check if armario exists
    const armario = await prisma.armario.findUnique({
      where: { id },
    });

    if (!armario) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Armario no encontrado" },
        { status: 404 }
      );
    }

    const where = {
      armarioId: id,
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
        armario: {
          id: armario.id,
          codigo: armario.codigo,
          nombre: armario.nombre,
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

    // Check if armario exists
    const armario = await prisma.armario.findUnique({
      where: { id },
    });

    if (!armario) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Armario no encontrado" },
        { status: 404 }
      );
    }

    // Generate auto-numbered code
    const autoCode = await generateOrganizadorCode(id);

    // Validate input data
    const validatedData = OrganizadorSchema.parse({
      ...body,
      codigo: autoCode, // Override with auto-generated code
      armarioId: id,
      estanteriaId: undefined // Ensure estanteriaId is null for armario organizadores
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

    // Create cajoncitos automatically if cantidadCajoncitos is provided
    if (validatedData.cantidadCajoncitos && validatedData.cantidadCajoncitos > 0) {
      await createCajoncitosForOrganizador(organizador.id, validatedData.cantidadCajoncitos);
    }

    // Fetch the organizador again with the cajoncitos count
    const updatedOrganizador = await prisma.organizador.findUnique({
      where: { id: organizador.id },
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
      data: updatedOrganizador,
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