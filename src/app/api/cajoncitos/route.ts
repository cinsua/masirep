import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { codigo: { contains: search, mode: "insensitive" as const } },
            { nombre: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get cajoncitos with full location hierarchy
    const cajoncitos = await prisma.cajoncito.findMany({
      where,
      include: {
        organizador: {
          include: {
            estanteria: {
              include: {
                ubicacion: {
                  select: {
                    id: true,
                    nombre: true,
                    codigo: true,
                  },
                },
              },
            },
            armario: {
              include: {
                ubicacion: {
                  select: {
                    id: true,
                    nombre: true,
                    codigo: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { codigo: 'asc' },
      take: 50, // Limit results for performance
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: cajoncitos,
    });
  } catch (error) {
    console.error("Error fetching cajoncitos:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}