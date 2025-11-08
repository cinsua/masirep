import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const estanteriaId = (await params).id;

    const estanteria = await prisma.estanteria.findUnique({
      where: { id: estanteriaId },
      include: {
        ubicacion: true,
      },
    });

    if (!estanteria) {
      return NextResponse.json(
        { success: false, error: "Estantería no encontrada" },
        { status: 404 }
      );
    }

    // Get counts separately
    const cajonesCount = await prisma.cajon.count({
      where: { estanteriaId },
    });

    const estantesCount = await prisma.estante.count({
      where: { estanteriaId },
    });

    const organizadoresCount = await prisma.organizador.count({
      where: { estanteriaId },
    });

    const repuestosCount = await prisma.repuestoUbicacion.count({
      where: { estanteriaId },
    });

    const estanteriaWithCounts = {
      ...estanteria,
      _count: {
        cajones: cajonesCount,
        estantes: estantesCount,
        organizadores: organizadoresCount,
        repuestos: repuestosCount,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        estanteria: estanteriaWithCounts,
        ubicacion: estanteria.ubicacion,
      },
    });
  } catch (error) {
    logger.error("Error fetching estanteria", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const estanteriaId = (await params).id;
    const body = await req.json();

    const estanteria = await prisma.estanteria.update({
      where: { id: estanteriaId },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
      },
      include: {
        ubicacion: true,
      },
    });

    // Get counts separately
    const cajonesCount = await prisma.cajon.count({
      where: { estanteriaId },
    });

    const estantesCount = await prisma.estante.count({
      where: { estanteriaId },
    });

    const organizadoresCount = await prisma.organizador.count({
      where: { estanteriaId },
    });

    const repuestosCount = await prisma.repuestoUbicacion.count({
      where: { estanteriaId },
    });

    const estanteriaWithCounts = {
      ...estanteria,
      _count: {
        cajones: cajonesCount,
        estantes: estantesCount,
        organizadores: organizadoresCount,
        repuestos: repuestosCount,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        estanteria: estanteriaWithCounts,
        ubicacion: estanteria.ubicacion,
      },
    });
  } catch (error) {
    logger.error("Error updating estanteria", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const estanteriaId = (await params).id;

    // Check if estanteria has cajones
    const cajonesCount = await prisma.cajon.count({
      where: { estanteriaId },
    });

    if (cajonesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No se puede eliminar la estantería porque contiene cajones"
        },
        { status: 400 }
      );
    }

    await prisma.estanteria.delete({
      where: { id: estanteriaId },
    });

    return NextResponse.json({
      success: true,
      message: "Estantería eliminada exitosamente",
    });
  } catch (error) {
    logger.error("Error deleting estanteria", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}