import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { code } = params;
    
    // Check if code already exists
    const existingRepuesto = await prisma.repuesto.findUnique({
      where: { codigo: code },
      select: {
        id: true,
        codigo: true,
        nombre: true,
      },
    });

    const isAvailable = !existingRepuesto;

    return NextResponse.json<ApiResponse<{ isAvailable: boolean; existingRepuesto?: { id: string; codigo: string; nombre: string } }>>({
      success: true,
      data: {
        isAvailable,
        ...(existingRepuesto && { existingRepuesto }),
      },
    });
  } catch (error) {
    console.error("Error validating repuesto code:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}