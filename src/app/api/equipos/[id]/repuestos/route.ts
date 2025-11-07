import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if equipo exists
    const equipo = await prisma.equipo.findUnique({
      where: { id },
    });

    if (!equipo) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Equipo not found",
          details: [`No equipo found with ID: ${id}`],
        },
        { status: 404 }
      );
    }

    // Get repuestos associations
    const repuestosAsociados = await prisma.repuestoEquipo.findMany({
      where: { equipoId: id },
      include: {
        repuesto: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: repuestosAsociados,
      message: `${repuestosAsociados.length} repuestos compatible with equipo`,
      details: [
        `Equipo: ${equipo.codigo} - ${equipo.nombre}`,
        `Total compatibilities: ${repuestosAsociados.length}`,
      ],
    });
  } catch (error) {
    console.error("Error fetching equipo repuestos:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch equipo repuestos",
        details: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { repuestoId } = body;

    if (!repuestoId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Missing required field",
          details: ["repuestoId is required"],
        },
        { status: 400 }
      );
    }

    // Check if equipo exists
    const equipo = await prisma.equipo.findUnique({
      where: { id },
    });

    if (!equipo) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Equipo not found",
          details: [`No equipo found with ID: ${id}`],
        },
        { status: 404 }
      );
    }

    // Check if repuesto exists
    const repuesto = await prisma.repuesto.findUnique({
      where: { id: repuestoId },
    });

    if (!repuesto) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Repuesto not found",
          details: [`No repuesto found with ID: ${repuestoId}`],
        },
        { status: 404 }
      );
    }

    // Check if association already exists
    const existingAssociation = await prisma.repuestoEquipo.findUnique({
      where: {
        repuestoId_equipoId: {
          repuestoId,
          equipoId: id,
        },
      },
    });

    if (existingAssociation) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Association already exists",
          details: [
            `Repuesto ${repuesto.codigo} ya está asociado al equipo ${equipo.codigo}`,
          ],
        },
        { status: 409 }
      );
    }

    // Create technical association
    const newAssociation = await prisma.repuestoEquipo.create({
      data: {
        equipoId: id,
        repuestoId,
      },
      include: {
        repuesto: true,
        equipo: true,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: newAssociation,
      message: "Repuesto compatible asociado exitosamente",
      details: [
        `Equipo: ${equipo.codigo} - ${equipo.nombre}`,
        `Repuesto: ${repuesto.codigo} - ${repuesto.nombre}`,
        "Asociación técnica (no afecta stock)",
      ],
    });
  } catch (error) {
    console.error("Error adding repuesto to equipo:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to add repuesto to equipo",
        details: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}