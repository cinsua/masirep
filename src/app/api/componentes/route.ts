import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Componentes API called");
    
    // Query with relaciones included
    const componentes = await prisma.componente.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        ubicaciones: {
          include: {
            cajoncito: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
      },
    });

    console.log("Componentes found:", componentes.length);

    // Transform data to match expected types
    const componentesWithStock = componentes.map(componente => ({
      ...componente,
      valorUnidad: componente.valorUnidad as Array<{ valor: string; unidad: string }>,
      stockActual: componente.ubicaciones.reduce(
        (total, ubicacion) => total + ubicacion.cantidad,
        0
      ),
    }));

    return NextResponse.json({
      success: true,
      data: componentesWithStock,
      pagination: {
        page: 1,
        limit: 10,
        total: componentes.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  } catch (error) {
    console.error("Error in componentes API:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}