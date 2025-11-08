import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { DivisionSchema } from "@/lib/validations/cajon";
import { logger } from "@/lib/logger";

interface Params {
  params: Promise<{ id: string }>;
}

// Helper function to generate auto-numbered code for divisions
async function generateDivisionCode(cajonId: string): Promise<string> {
  const lastDivision = await prisma.division.findFirst({
    where: { cajonId },
    orderBy: { codigo: 'desc' },
  });

  if (!lastDivision) {
    return "DIV-001";
  }

  // Extract number from code like "DIV-001" and increment
  const match = lastDivision.codigo.match(/DIV-(\d{3})$/);
  if (match) {
    const nextNumber = parseInt(match[1]) + 1;
    return `DIV-${nextNumber.toString().padStart(3, '0')}`;
  }

  // If no match, start with DIV-001
  return "DIV-001";
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

    // Check if cajon exists
    const cajon = await prisma.cajon.findUnique({
      where: { id },
    });

    if (!cajon) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cajón no encontrado" },
        { status: 404 }
      );
    }

    const where = {
      cajonId: id,
      ...(search && {
        OR: [
          { codigo: { contains: search, mode: "insensitive" as const } },
          { nombre: { contains: search, mode: "insensitive" as const } },
          { descripcion: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const divisiones = await prisma.division.findMany({
      where,
      orderBy: { codigo: 'asc' },
      include: {
        _count: {
          select: {
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        divisiones,
        cajon: {
          id: cajon.id,
          codigo: cajon.codigo,
          nombre: cajon.nombre,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching divisiones", error);
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

    // Check if cajon exists
    const cajon = await prisma.cajon.findUnique({
      where: { id },
    });

    if (!cajon) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cajón no encontrado" },
        { status: 404 }
      );
    }

    // Check for maximum divisions per cajon (optional business rule)
    const existingDivisions = await prisma.division.count({
      where: { cajonId: id },
    });

    if (existingDivisions >= 20) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No se pueden crear más de 20 divisiones por cajón" },
        { status: 409 }
      );
    }

    // Generate auto-numbered code
    const autoCode = await generateDivisionCode(id);

    // Validate input data
    const validatedData = DivisionSchema.parse({
      ...body,
      codigo: autoCode, // Override with auto-generated code
      cajonId: id,
    });

    // Check if codigo already exists
    const existingDivision = await prisma.division.findUnique({
      where: { codigo: validatedData.codigo },
    });

    if (existingDivision) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El código de división ya existe" },
        { status: 409 }
      );
    }

    const division = await prisma.division.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            repuestos: true,
          }
        }
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: division,
    }, { status: 201 });
  } catch (error) {
    logger.error("Error creating division", error);
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