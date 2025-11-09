import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Componentes DEBUG API called");
    
    // Simple query without authentication for testing
    const componentes = await prisma.componente.findMany({
      where: { isActive: true },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    console.log("Componentes found:", componentes.length);

    return NextResponse.json({
      success: true,
      data: componentes,
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
    console.error("Error in componentes DEBUG API:", error);
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