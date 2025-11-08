import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiResponse } from "@/types/api";
import { StockCalculator } from "@/lib/services/stock-calculator";
import { z } from "zod";

// Query parameter schema for stock endpoint
const stockQuerySchema = z.object({
  itemType: z.enum(["repuesto", "componente", "all"]).optional().default("all"),
  lowStock: z.enum(["true", "false"]).optional().default("false"),
  includeInactive: z.enum(["true", "false"]).optional().default("false"),
  includeZero: z.enum(["true", "false"]).optional().default("false"),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
});

// GET - Get stock information for items
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryValidation = stockQuerySchema.safeParse(Object.fromEntries(searchParams));

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

    const {
      itemType,
      lowStock,
      includeInactive,
      includeZero,
      page,
      limit
    } = queryValidation.data;

    const options = {
      includeInactiveItems: includeInactive === "true",
      includeZeroQuantities: includeZero === "true",
    };

    let result: any = {};

    if (lowStock === "true") {
      // Get only low stock items (repuestos only)
      const lowStockItems = await StockCalculator.getLowStockItems(options);

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = lowStockItems.slice(startIndex, endIndex);

      result = {
        items: paginatedItems,
        summary: {
          totalItems: lowStockItems.length,
          totalPages: Math.ceil(lowStockItems.length / limit),
          currentPage: page,
          itemType: 'repuestos',
          filter: 'low-stock',
        },
      };
    } else {
      // Get all stock information
      const stockData = await StockCalculator.recalculateAllStock(
        itemType as 'repuesto' | 'componente' | 'all',
        options
      );

      let allItems: any[] = [];
      let summaryTotal = 0;

      if (itemType === 'repuesto' || itemType === 'all') {
        allItems = [...allItems, ...stockData.repuestos];
        summaryTotal += stockData.summary.totalRepuestos;
      }

      if (itemType === 'componente' || itemType === 'all') {
        allItems = [...allItems, ...stockData.componentes];
        summaryTotal += stockData.summary.totalComponentes;
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = allItems.slice(startIndex, endIndex);

      result = {
        items: paginatedItems,
        summary: {
          ...stockData.summary,
          totalItems: summaryTotal,
          totalPages: Math.ceil(allItems.length / limit),
          currentPage: page,
          itemType,
          filter: 'all',
        },
      };
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}