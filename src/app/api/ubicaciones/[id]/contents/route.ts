import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import { z } from "zod";

// Query parameter schema
const querySchema = z.object({
  itemType: z.enum(["repuestos", "componentes", "all"]).optional().default("all"),
  includeChildren: z.enum(["true", "false"]).optional().default("true"),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
});

// Helper function to get all child location IDs recursively
async function getAllChildLocationIds(locationId: string, locationType: string): Promise<string[]> {
  const childIds: string[] = [];

  switch (locationType) {
    case "ubicacion":
      // Get all armarios and estanterias in this location
      const [armarios, estanterias] = await Promise.all([
        prisma.armario.findMany({
          where: { ubicacionId: locationId },
          select: { id: true }
        }),
        prisma.estanteria.findMany({
          where: { ubicacionId: locationId },
          select: { id: true }
        })
      ]);

      for (const armario of armarios) {
        childIds.push(armario.id);
        const armarioChildren = await getAllChildLocationIds(armario.id, "armario");
        childIds.push(...armarioChildren);
      }

      for (const estanteria of estanterias) {
        childIds.push(estanteria.id);
        const estanteriaChildren = await getAllChildLocationIds(estanteria.id, "estanteria");
        childIds.push(...estanteriaChildren);
      }
      break;

    case "armario":
      // Get all cajones in this armario
      const cajones = await prisma.cajon.findMany({
        where: { armarioId: locationId },
        select: { id: true }
      });

      for (const cajon of cajones) {
        childIds.push(cajon.id);
        const cajonChildren = await getAllChildLocationIds(cajon.id, "cajon");
        childIds.push(...cajonChildren);
      }
      break;

    case "estanteria":
      // Get all estantes and organizadores in this estanteria
      const [estantes, organizadores] = await Promise.all([
        prisma.estante.findMany({
          where: { estanteriaId: locationId },
          select: { id: true }
        }),
        prisma.organizador.findMany({
          where: { estanteriaId: locationId },
          select: { id: true }
        })
      ]);

      for (const estante of estantes) {
        childIds.push(estante.id);
        const estanteChildren = await getAllChildLocationIds(estante.id, "estante");
        childIds.push(...estanteChildren);
      }

      for (const organizador of organizadores) {
        childIds.push(organizador.id);
        const organizadorChildren = await getAllChildLocationIds(organizador.id, "organizador");
        childIds.push(...organizadorChildren);
      }
      break;

    case "estante":
      // Estante model doesn't have cajones directly - cajones are attached to estanteria
      // This case may need to be implemented differently based on business logic
      // For now, return empty array as estante doesn't have child locations
      break;

    case "cajon":
      // Get all divisions in this cajon
      const divisions = await prisma.division.findMany({
        where: { cajonId: locationId },
        select: { id: true }
      });

      for (const division of divisions) {
        childIds.push(division.id);
      }
      break;

    case "organizador":
      // Get all cajoncitos in this organizador
      const cajoncitos = await prisma.cajoncito.findMany({
        where: { organizadorId: locationId },
        select: { id: true }
      });

      for (const cajoncito of cajoncitos) {
        childIds.push(cajoncito.id);
      }
      break;
  }

  return childIds;
}

// Helper function to get items at a specific location type
async function getItemsAtLocation(
  locationId: string,
  locationType: string,
  itemType: string,
  includeChildren: boolean
) {
  const allLocationIds = includeChildren
    ? [locationId, ...await getAllChildLocationIds(locationId, locationType)]
    : [locationId];

  let repuestosItems: any[] = [];
  let componentesItems: any[] = [];

  // Get repuestos at these locations
  if (itemType === "repuestos" || itemType === "all") {
    const repuestosConditions = [];

    if (locationType === "ubicacion") {
      // For ubicacion level, we need to check all child location types
      repuestosConditions.push(
        { armarioId: { in: allLocationIds.filter(id => id.startsWith("arm")) } },
        { estanteriaId: { in: allLocationIds.filter(id => id.startsWith("est")) } }
      );
    } else {
      // For specific location types
      switch (locationType) {
        case "armario":
          repuestosConditions.push({ armarioId: { in: allLocationIds } });
          break;
        case "estanteria":
          repuestosConditions.push({ estanteriaId: { in: allLocationIds } });
          break;
        case "estante":
          repuestosConditions.push({ estanteId: { in: allLocationIds } });
          break;
        case "cajon":
          repuestosConditions.push({ cajonId: { in: allLocationIds } });
          break;
        case "division":
          repuestosConditions.push({ divisionId: { in: allLocationIds } });
          break;
        case "cajoncito":
          repuestosConditions.push({ cajoncitoId: { in: allLocationIds } });
          break;
      }
    }

    if (repuestosConditions.length > 0) {
      const whereClause = repuestosConditions.length === 1
        ? repuestosConditions[0]
        : { OR: repuestosConditions };

      repuestosItems = await prisma.repuestoUbicacion.findMany({
        where: {
          ...whereClause,
          repuesto: { isActive: true },
        },
        include: {
          repuesto: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              descripcion: true,
              categoria: true,
              stockMinimo: true,
              isActive: true,
            },
          },
          armario: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              ubicacion: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
          estanteria: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              ubicacion: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
          estante: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              estanteria: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
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
          cajon: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              armario: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                  ubicacion: {
                    select: {
                      id: true,
                      nombre: true,
                      codigo: true,
                    },
                  },
                },
              },
              estanteria: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
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
          division: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              cajon: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                  armario: {
                    select: {
                      id: true,
                      nombre: true,
                      codigo: true,
                      ubicacion: {
                        select: {
                          id: true,
                          nombre: true,
                          codigo: true,
                        },
                      },
                    },
                  },
                  estanteria: {
                    select: {
                      id: true,
                      nombre: true,
                      codigo: true,
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
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }
  }

  // Get componentes at these locations (only in cajoncitos)
  if (itemType === "componentes" || itemType === "all") {
    const cajoncitoIds = allLocationIds.filter(id => id.startsWith("caj"));

    if (cajoncitoIds.length > 0) {
      componentesItems = await prisma.componenteUbicacion.findMany({
        where: { 
          cajoncitoId: { in: cajoncitoIds },
          componente: { isActive: true },
        },
        include: {
          componente: {
            select: {
              id: true,
              descripcion: true,
              categoria: true,
              valorUnidad: true,
              stockMinimo: true,
              isActive: true,
            },
          },
          cajoncito: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              organizador: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                  estanteria: {
                    select: {
                      id: true,
                      nombre: true,
                      codigo: true,
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
                    select: {
                      id: true,
                      nombre: true,
                      codigo: true,
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
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }
  }

  return {
    repuestos: repuestosItems,
    componentes: componentesItems,
    totalItems: repuestosItems.length + componentesItems.length,
    repuestosCount: repuestosItems.reduce((sum, item) => sum + item.cantidad, 0),
    componentesCount: componentesItems.reduce((sum, item) => sum + item.cantidad, 0),
  };
}

// GET - Get all items at a location (and optionally its children)
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

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryValidation = querySchema.safeParse(Object.fromEntries(searchParams));

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

    const { itemType, includeChildren, page, limit } = queryValidation.data;
    const includeChildrenBool = includeChildren === "true";

    // Determine location type and verify location exists
    let locationType = "ubicacion";
    let locationExists = false;

    // Try different location types to find the location
    const locationChecks = [
      { type: "ubicacion", query: () => prisma.ubicacion.findUnique({ where: { id }, select: { id: true } }) },
      { type: "armario", query: () => prisma.armario.findUnique({ where: { id }, select: { id: true } }) },
      { type: "estanteria", query: () => prisma.estanteria.findUnique({ where: { id }, select: { id: true } }) },
      { type: "estante", query: () => prisma.estante.findUnique({ where: { id }, select: { id: true } }) },
      { type: "cajon", query: () => prisma.cajon.findUnique({ where: { id }, select: { id: true } }) },
      { type: "division", query: () => prisma.division.findUnique({ where: { id }, select: { id: true } }) },
      { type: "organizador", query: () => prisma.organizador.findUnique({ where: { id }, select: { id: true } }) },
      { type: "cajoncito", query: () => prisma.cajoncito.findUnique({ where: { id }, select: { id: true } }) },
    ];

    for (const check of locationChecks) {
      const result = await check.query();
      if (result) {
        locationType = check.type;
        locationExists = true;
        break;
      }
    }

    if (!locationExists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Ubicación no encontrada" },
        { status: 404 }
      );
    }

    // Get items at the location
    const itemsData = await getItemsAtLocation(id, locationType, itemType, includeChildrenBool);

    // Apply pagination if needed
    const allItems = [
      ...itemsData.repuestos.map(item => ({ ...item, itemType: 'repuesto' })),
      ...itemsData.componentes.map(item => ({ ...item, itemType: 'componente' }))
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = allItems.slice(startIndex, endIndex);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        locationId: id,
        locationType,
        itemType,
        includeChildren: includeChildrenBool,
        items: paginatedItems,
        summary: {
          totalItems: itemsData.totalItems,
          repuestosCount: itemsData.repuestosCount,
          componentesCount: itemsData.componentesCount,
          totalPages: Math.ceil(allItems.length / limit),
          currentPage: page,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching location contents:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}