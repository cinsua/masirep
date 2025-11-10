import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import {
  UbicacionSchema,
  UbicacionSearchParamsSchema,
  UbicacionFormData,
  UbicacionUpdateFormData
} from "@/lib/validations/ubicacion";

// Helper function to build location tree recursively
async function buildLocationTree() {
  // Get all locations from the database
  const [
    ubicaciones,
    armarios,
    estanterias,
    estantes,
    cajones,
    divisions,
    organizadores,
    cajoncitos
  ] = await Promise.all([
    prisma.ubicacion.findMany({
      orderBy: { nombre: 'asc' }
    }),
    prisma.armario.findMany({
      include: {
        ubicacion: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
      },
      orderBy: { nombre: 'asc' }
    }),
    prisma.estanteria.findMany({
      include: {
        ubicacion: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
      },
      orderBy: { nombre: 'asc' }
    }),
    prisma.estante.findMany({
      include: {
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
      orderBy: { nombre: 'asc' }
    }),
    prisma.cajon.findMany({
      include: {
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
      orderBy: { nombre: 'asc' }
    }),
    prisma.division.findMany({
      include: {
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
      orderBy: { nombre: 'asc' }
    }),
    prisma.organizador.findMany({
      include: {
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
      orderBy: { nombre: 'asc' }
    }),
    prisma.cajoncito.findMany({
      include: {
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
      orderBy: { nombre: 'asc' }
    }),
  ]);

  // Build the hierarchical tree structure
  const locationTree: any[] = [];

  // Add ubicaciones as root nodes
  for (const ubicacion of ubicaciones) {
    const node: any = {
      id: ubicacion.id,
      nombre: ubicacion.nombre,
      codigo: ubicacion.codigo,
      type: 'ubicacion',
      children: []
    };

    // Add armarios for this ubicacion
    const ubicacionArmarios = armarios.filter(a => a.ubicacionId === ubicacion.id);
    for (const armario of ubicacionArmarios) {
      const armarioNode: any = {
        id: armario.id,
        nombre: armario.nombre,
        codigo: armario.codigo,
        type: 'armario',
        children: []
      };

      // Add cajones for this armario
      const armarioCajones = cajones.filter(c => c.armarioId === armario.id);
      for (const cajon of armarioCajones) {
        const cajonNode: any = {
          id: cajon.id,
          nombre: cajon.nombre,
          codigo: cajon.codigo,
          type: 'cajon',
          children: []
        };

        // Add divisions for this cajon
        const cajonDivisions = divisions.filter(d => d.cajonId === cajon.id);
        for (const division of cajonDivisions) {
          cajonNode.children.push({
            id: division.id,
            nombre: division.nombre,
            codigo: division.codigo,
            type: 'division'
          });
        }

        armarioNode.children.push(cajonNode);
      }

      // Add organizadores for this armario
      const armarioOrganizadores = organizadores.filter(o => o.armarioId === armario.id);
      for (const organizador of armarioOrganizadores) {
        const organizadorNode: any = {
          id: organizador.id,
          nombre: organizador.nombre,
          codigo: organizador.codigo,
          type: 'organizador',
          children: []
        };

        // Add cajoncitos for this organizador
        const organizadorCajoncitos = cajoncitos.filter(c => c.organizadorId === organizador.id);
        for (const cajoncito of organizadorCajoncitos) {
          organizadorNode.children.push({
            id: cajoncito.id,
            nombre: cajoncito.nombre,
            codigo: cajoncito.codigo,
            type: 'cajoncito'
          });
        }

        armarioNode.children.push(organizadorNode);
      }

      node.children.push(armarioNode);
    }

    // Add estanterias for this ubicacion
    const ubicacionEstanterias = estanterias.filter(e => e.ubicacionId === ubicacion.id);
    for (const estanteria of ubicacionEstanterias) {
      const estanteriaNode: any = {
        id: estanteria.id,
        nombre: estanteria.nombre,
        codigo: estanteria.codigo,
        type: 'estanteria',
        children: []
      };

      // Add estantes for this estanteria
      const estanteriaEstantes = estantes.filter(e => e.estanteriaId === estanteria.id);
      for (const estante of estanteriaEstantes) {
        const estanteNode: any = {
          id: estante.id,
          nombre: estante.nombre,
          codigo: estante.codigo,
          type: 'estante',
          children: []
        };

        // Cajones are attached to estanteria, not estante - this logic needs to be reviewed
        // For now, we'll not include cajones under estante
        const estanteCajones: any[] = [];
        for (const cajon of estanteCajones) {
          const cajonNode: any = {
            id: cajon.id,
            nombre: cajon.nombre,
            codigo: cajon.codigo,
            type: 'cajon',
            children: []
          };

          // Add divisions for this cajon
          const cajonDivisions = divisions.filter(d => d.cajonId === cajon.id);
          for (const division of cajonDivisions) {
            cajonNode.children.push({
              id: division.id,
              nombre: division.nombre,
              codigo: division.codigo,
              type: 'division'
            });
          }

          estanteNode.children.push(cajonNode);
        }

        estanteriaNode.children.push(estanteNode);
      }

      // Add organizadores for this estanteria
      const estanteriaOrganizadores = organizadores.filter(o => o.estanteriaId === estanteria.id);
      for (const organizador of estanteriaOrganizadores) {
        const organizadorNode: any = {
          id: organizador.id,
          nombre: organizador.nombre,
          codigo: organizador.codigo,
          type: 'organizador',
          children: []
        };

        // Add cajoncitos for this organizador
        const organizadorCajoncitos = cajoncitos.filter(c => c.organizadorId === organizador.id);
        for (const cajoncito of organizadorCajoncitos) {
          organizadorNode.children.push({
            id: cajoncito.id,
            nombre: cajoncito.nombre,
            codigo: cajoncito.codigo,
            type: 'cajoncito'
          });
        }

        estanteriaNode.children.push(organizadorNode);
      }

      node.children.push(estanteriaNode);
    }

    locationTree.push(node);
  }

  return locationTree;
}

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
    const type = searchParams.get("type") || "";
    const tree = searchParams.get("tree") === "true";

    // If requesting hierarchical tree structure
    if (tree) {
      const locationTree = await buildLocationTree();
      return NextResponse.json<ApiResponse>({
        success: true,
        data: locationTree,
      });
    }

    // If requesting specific type (legacy support)
    if (type && type !== "ubicacion") {
      let data: unknown[] = [];

      // Build where clause for search
      const where = search
        ? {
            OR: [
              { codigo: { contains: search, mode: "insensitive" as const } },
              { nombre: { contains: search, mode: "insensitive" as const } },
              { descripcion: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      // Fetch based on type
      switch (type) {
        case "armario":
          data = await prisma.armario.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        case "estanteria":
          data = await prisma.estanteria.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        case "estante":
          data = await prisma.estante.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        case "cajon":
          data = await prisma.cajon.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        case "division":
          data = await prisma.division.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        case "cajoncito":
          data = await prisma.cajoncito.findMany({
            where,
            select: { id: true, codigo: true, nombre: true },
            orderBy: { nombre: 'asc' },
          });
          break;
        default:
          // Return all types if no specific type
          const [armarios, estanterias, estantes, cajones, divisiones, cajoncitos] = await Promise.all([
            prisma.armario.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
            prisma.estanteria.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
            prisma.estante.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
            prisma.cajon.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
            prisma.division.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
            prisma.cajoncito.findMany({ where, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
          ]);

          data = [
            ...armarios.map(item => ({ ...item, type: 'armario' })),
            ...estanterias.map(item => ({ ...item, type: 'estanteria' })),
            ...estantes.map(item => ({ ...item, type: 'estante' })),
            ...cajones.map(item => ({ ...item, type: 'cajon' })),
            ...divisiones.map(item => ({ ...item, type: 'division' })),
            ...cajoncitos.map(item => ({ ...item, type: 'cajoncito' })),
          ];
          break;
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        data,
      });
    }

    // Enhanced ubicaciones endpoint with pagination and search
    const searchParamsParsed = UbicacionSearchParamsSchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const where = {
      ...(searchParamsParsed.search && {
        OR: [
          { codigo: { contains: searchParamsParsed.search, mode: "insensitive" as const } },
          { nombre: { contains: searchParamsParsed.search, mode: "insensitive" as const } },
          { descripcion: { contains: searchParamsParsed.search, mode: "insensitive" as const } },
        ],
      }),
      ...(searchParamsParsed.isActive !== undefined && {
        isActive: searchParamsParsed.isActive,
      }),
    };

    const [ubicaciones, total] = await Promise.all([
      prisma.ubicacion.findMany({
        where,
        orderBy: { [searchParamsParsed.sortBy]: searchParamsParsed.sortOrder },
        skip: (searchParamsParsed.page - 1) * searchParamsParsed.limit,
        take: searchParamsParsed.limit,
        include: {
          _count: {
            select: {
              armarios: true,
              estanterias: true,
            }
          }
        }
      }),
      prisma.ubicacion.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ubicaciones,
        pagination: {
          page: searchParamsParsed.page,
          limit: searchParamsParsed.limit,
          total,
          pages: Math.ceil(total / searchParamsParsed.limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching ubicaciones:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: UbicacionFormData = await req.json();

    // Generate code automatically if not provided or empty
    let finalData = { ...body };
    if (!finalData.codigo || finalData.codigo.trim() === '') {
      let generatedCode: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        generatedCode = `LOC${Date.now().toString().slice(-6)}${attempts > 0 ? attempts.toString() : ''}`;
        attempts++;
      } while (
        attempts < maxAttempts &&
        await prisma.ubicacion.findUnique({ where: { codigo: generatedCode } })
      );

      if (attempts >= maxAttempts) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "No se pudo generar un código único" },
          { status: 500 }
        );
      }

      finalData.codigo = generatedCode;
    } else {
      // Check if codigo already exists
      const existingUbicacion = await prisma.ubicacion.findUnique({
        where: { codigo: finalData.codigo },
      });

      if (existingUbicacion) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "El código de ubicación ya existe" },
          { status: 409 }
        );
      }
    }

    // Now validate with the complete data (codigo is guaranteed to be set at this point)
    const validatedData = UbicacionSchema.parse(finalData);

    const ubicacion = await prisma.ubicacion.create({
      data: validatedData as any, // codigo is guaranteed to be set by this point
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ubicacion,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating ubicacion:", error);
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Datos inválidos", details: [JSON.stringify((error as any).issues || [])] },
        { status: 400 }
      );
    }
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}