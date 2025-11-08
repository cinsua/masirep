import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api";
import {
  repuestoAssociationSchema,
  routeParamsSchema
} from "@/lib/validations/associacion";

// GET - Get all ubicaciones for a repuesto
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

    // Validate route parameters
    const validation = routeParamsSchema.safeParse({ id });
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID de repuesto inválido" },
        { status: 400 }
      );
    }

    // Check if repuesto exists
    const repuesto = await prisma.repuesto.findFirst({
      where: { id: id, isActive: true },
    });

    if (!repuesto) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Repuesto no encontrado" },
        { status: 404 }
      );
    }

    // Get all ubicaciones for the repuesto with nested location data
    const ubicaciones = await prisma.repuestoUbicacion.findMany({
      where: { repuestoId: id },
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

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ubicaciones,
    });
  } catch (error) {
    console.error("Error fetching repuesto ubicaciones:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add ubicacion to a repuesto
export async function POST(
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

    // Validate route parameters
    const routeValidation = routeParamsSchema.safeParse({ id });
    if (!routeValidation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID de repuesto inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate request body
    const validation = repuestoAssociationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Datos inválidos",
          details: validation.error.issues.map(err => err.message)
        },
        { status: 400 }
      );
    }

    const {
      armarioId,
      estanteriaId,
      estanteId,
      cajonId,
      divisionId,
      cajoncitoId,
      cantidad
    } = validation.data;

    // Check if repuesto exists
    const repuesto = await prisma.repuesto.findFirst({
      where: { id: id, isActive: true },
    });

    if (!repuesto) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Repuesto no encontrado" },
        { status: 404 }
      );
    }

    // Validate that the specified location exists
    let locationExists = false;
    let locationData = null;

    if (armarioId) {
      locationData = await prisma.armario.findUnique({
        where: { id: armarioId },
        include: {
          ubicacion: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
            },
          },
        },
      });
      locationExists = !!locationData;
    } else if (estanteriaId) {
      locationData = await prisma.estanteria.findUnique({
        where: { id: estanteriaId },
        include: {
          ubicacion: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
            },
          },
        },
      });
      locationExists = !!locationData;
    } else if (estanteId) {
      locationData = await prisma.estante.findUnique({
        where: { id: estanteId },
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
      });
      locationExists = !!locationData;
    } else if (cajonId) {
      locationData = await prisma.cajon.findUnique({
        where: { id: cajonId },
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
      });
      locationExists = !!locationData;
    } else if (divisionId) {
      locationData = await prisma.division.findUnique({
        where: { id: divisionId },
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
      });
      locationExists = !!locationData;
    } else if (cajoncitoId) {
      locationData = await prisma.cajoncito.findUnique({
        where: { id: cajoncitoId },
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
      });
      locationExists = !!locationData;
    }

    if (!locationExists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Ubicación no encontrada" },
        { status: 404 }
      );
    }

    // Check if this association already exists
    const existingAssociation = await prisma.repuestoUbicacion.findFirst({
      where: {
        repuestoId: id,
        armarioId,
        estanteriaId,
        estanteId,
        cajonId,
        divisionId,
      },
    });

    if (existingAssociation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El repuesto ya está asociado a esta ubicación" },
        { status: 409 }
      );
    }

    // Create the association
    const result = await prisma.$transaction(async (tx) => {
      const ubicacion = await tx.repuestoUbicacion.create({
        data: {
          repuestoId: id,
          armarioId,
          estanteriaId,
          estanteId,
          cajonId,
          divisionId,
          cantidad,
        },
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
      });

      return ubicacion;
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: "Ubicación agregada exitosamente",
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding repuesto ubicacion:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}