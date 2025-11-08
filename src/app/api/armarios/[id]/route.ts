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

    const armarioId = (await params).id;

    const armario = await prisma.armario.findUnique({
      where: { id: armarioId },
      include: {
        ubicacion: true,
      },
    });

    if (!armario) {
      return NextResponse.json(
        { success: false, error: "Armario no encontrado" },
        { status: 404 }
      );
    }

    // Get counts separately
    const cajonesCount = await prisma.cajon.count({
      where: { armarioId },
    });

    const organizadoresCount = await prisma.organizador.count({
      where: { armarioId },
    });

    const repuestosCount = await prisma.repuestoUbicacion.count({
      where: { armarioId },
    });

    const armarioWithCounts = {
      ...armario,
      _count: {
        cajones: cajonesCount,
        organizadores: organizadoresCount,
        repuestos: repuestosCount,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        armario: armarioWithCounts,
        ubicacion: armario.ubicacion,
      },
    });
  } catch (error) {
    logger.error("Error fetching armario", error);
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

    const armarioId = (await params).id;
    const body = await req.json();

    const armario = await prisma.armario.update({
      where: { id: armarioId },
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
      where: { armarioId },
    });

    const organizadoresCount = await prisma.organizador.count({
      where: { armarioId },
    });

    const repuestosCount = await prisma.repuestoUbicacion.count({
      where: { armarioId },
    });

    const armarioWithCounts = {
      ...armario,
      _count: {
        cajones: cajonesCount,
        organizadores: organizadoresCount,
        repuestos: repuestosCount,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        armario: armarioWithCounts,
        ubicacion: armario.ubicacion,
      },
    });
  } catch (error) {
    logger.error("Error updating armario", error);
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

    const armarioId = (await params).id;

    // Check if armario has cajones
    const cajonesCount = await prisma.cajon.count({
      where: { armarioId },
    });

    if (cajonesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No se puede eliminar el armario porque contiene cajones"
        },
        { status: 400 }
      );
    }

    await prisma.armario.delete({
      where: { id: armarioId },
    });

    return NextResponse.json({
      success: true,
      message: "Armario eliminado exitosamente",
    });
  } catch (error) {
    logger.error("Error deleting armario", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}