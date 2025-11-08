import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiResponse } from "@/types/api";
import { StockCalculator } from "@/lib/services/stock-calculator";
import { z } from "zod";

// Query parameter schema for individual item stock
const itemStockQuerySchema = z.object({
  includeInactive: z.enum(["true", "false"]).optional().default("false"),
  includeZero: z.enum(["true", "false"]).optional().default("false"),
});

// Route parameters schema
const itemStockParamsSchema = z.object({
  itemType: z.enum(["repuesto", "componente"]),
  itemId: z.string().min(1, "El ID del item es requerido"),
});

// GET - Get stock information for a specific item
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ itemType: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { itemType, itemId } = await params;

    // Validate route parameters
    const routeValidation = itemStockParamsSchema.safeParse({ itemType, itemId });
    if (!routeValidation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Parámetros inválidos",
          details: routeValidation.error.issues.map(err => err.message)
        },
        { status: 400 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryValidation = itemStockQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Parámetros inválidos",
          details: queryValidation.error.issues.map(err => err.message)
        },
        { status: 400 }
      );
    }

    const { includeInactive, includeZero } = queryValidation.data;

    const options = {
      includeInactiveItems: includeInactive === "true",
      includeZeroQuantities: includeZero === "true",
    };

    // Calculate stock for the specific item
    let stockData;
    if (itemType === "repuesto") {
      stockData = await StockCalculator.calculateRepuestoStock(itemId, options);
    } else {
      stockData = await StockCalculator.calculateComponenteStock(itemId, options);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: stockData,
    });
  } catch (error) {
    console.error(`Error calculating stock for item:`, error);

    let errorMessage = "Internal server error";
    if (error instanceof Error) {
      if (error.message.includes("no encontrado")) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: error.message },
          { status: 404 }
        );
      }
      errorMessage = error.message;
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}