import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Componentes API called");
    
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("No session found");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Session found:", session.user?.email);

    // Simple query without any complex relations
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