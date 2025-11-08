import { prisma } from "@/lib/prisma";

export interface LocationStock {
  locationId: string;
  locationType: string;
  locationName: string;
  locationCode: string;
  quantity: number;
  locationPath?: string; // Full hierarchy path for context
}

export interface DistributedStock {
  itemId: string;
  itemType: 'repuesto' | 'componente';
  itemName: string;
  itemCode: string;
  totalStock: number;
  locations: LocationStock[];
  lowStockThreshold?: number;
  isLowStock: boolean;
}

export interface StockCalculationOptions {
  includeInactiveItems?: boolean;
  includeZeroQuantities?: boolean;
  groupByLocationType?: boolean;
}

/**
 * Stock Calculator Service
 *
 * Provides real-time stock calculation across all storage locations
 * with support for distributed stock tracking and performance optimization.
 */
export class StockCalculator {
  /**
   * Calculate total stock for a repuesto across all locations
   */
  static async calculateRepuestoStock(
    repuestoId: string,
    options: StockCalculationOptions = {}
  ): Promise<DistributedStock> {
    const {
      includeInactiveItems = false,
      includeZeroQuantities = false,
      groupByLocationType = false
    } = options;

    // Get repuesto info
    const repuesto = await prisma.repuesto.findFirst({
      where: {
        id: repuestoId,
        ...(includeInactiveItems ? {} : { isActive: true })
      },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        stockMinimo: true,
      }
    });

    if (!repuesto) {
      throw new Error(`Repuesto con ID ${repuestoId} no encontrado`);
    }

    // Get all associations for this repuesto
    const associations = await prisma.repuestoUbicacion.findMany({
      where: { repuestoId },
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

    // Transform associations into location stocks
    const locationStocks: LocationStock[] = associations
      .filter(assoc => includeZeroQuantities || assoc.cantidad > 0)
      .map(assoc => {
        let location: any = null;
        let locationType = '';
        let locationPath = '';

        if (assoc.armario) {
          location = assoc.armario;
          locationType = 'armario';
          locationPath = `${location.ubicacion?.nombre || ''} > ${location.nombre}`;
        } else if (assoc.estanteria) {
          location = assoc.estanteria;
          locationType = 'estanteria';
          locationPath = `${location.ubicacion?.nombre || ''} > ${location.nombre}`;
        } else if (assoc.estante) {
          location = assoc.estante;
          locationType = 'estante';
          locationPath = `${location.estanteria?.ubicacion?.nombre || ''} > ${location.estanteria?.nombre || ''} > ${location.nombre}`;
        } else if (assoc.cajon) {
          location = assoc.cajon;
          locationType = 'cajon';
          if (location.armario) {
            locationPath = `${location.armario?.ubicacion?.nombre || ''} > ${location.armario?.nombre || ''} > ${location.nombre}`;
          } else if (location.estanteria) {
            locationPath = `${location.estanteria?.ubicacion?.nombre || ''} > ${location.estanteria?.nombre || ''} > ${location.nombre}`;
          }
        } else if (assoc.division) {
          location = assoc.division;
          locationType = 'division';
          const cajon = location.cajon;
          if (cajon?.armario) {
            locationPath = `${cajon.armario?.ubicacion?.nombre || ''} > ${cajon.armario?.nombre || ''} > ${cajon.nombre} > ${location.nombre}`;
          } else if (cajon?.estanteria) {
            locationPath = `${cajon.estanteria?.ubicacion?.nombre || ''} > ${cajon.estanteria?.nombre || ''} > ${cajon.nombre} > ${location.nombre}`;
          }
        }

        return {
          locationId: location?.id || '',
          locationType,
          locationName: location?.nombre || 'Unknown',
          locationCode: location?.codigo || '',
          quantity: assoc.cantidad,
          locationPath: locationPath || 'Unknown',
        };
      });

    const totalStock = locationStocks.reduce((sum, loc) => sum + loc.quantity, 0);
    const isLowStock = repuesto.stockMinimo ? totalStock <= repuesto.stockMinimo : false;

    return {
      itemId: repuesto.id,
      itemType: 'repuesto',
      itemName: repuesto.nombre,
      itemCode: repuesto.codigo,
      totalStock,
      locations: locationStocks,
      lowStockThreshold: repuesto.stockMinimo,
      isLowStock,
    };
  }

  /**
   * Calculate total stock for a componente across all locations
   */
  static async calculateComponenteStock(
    componenteId: string,
    options: StockCalculationOptions = {}
  ): Promise<DistributedStock> {
    const {
      includeInactiveItems = false,
      includeZeroQuantities = false
    } = options;

    // Get componente info
    const componente = await prisma.componente.findFirst({
      where: {
        id: componenteId,
        ...(includeInactiveItems ? {} : { isActive: true })
      },
      select: {
        id: true,
        descripcion: true,
        categoria: true,
      }
    });

    if (!componente) {
      throw new Error(`Componente con ID ${componenteId} no encontrado`);
    }

    // Get all associations for this componente
    const associations = await prisma.componenteUbicacion.findMany({
      where: { componenteId },
      include: {
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
    });

    // Transform associations into location stocks
    const locationStocks: LocationStock[] = associations
      .filter(assoc => includeZeroQuantities || assoc.cantidad > 0)
      .map(assoc => {
        const cajoncito = assoc.cajoncito;
        const organizador = cajoncito?.organizador;

        let locationPath = '';
        if (organizador?.estanteria) {
          locationPath = `${organizador.estanteria?.ubicacion?.nombre || ''} > ${organizador.estanteria?.nombre || ''} > ${organizador?.nombre || ''} > ${cajoncito?.nombre || ''}`;
        } else if (organizador?.armario) {
          locationPath = `${organizador.armario?.ubicacion?.nombre || ''} > ${organizador.armario?.nombre || ''} > ${organizador?.nombre || ''} > ${cajoncito?.nombre || ''}`;
        }

        return {
          locationId: cajoncito?.id || '',
          locationType: 'cajoncito',
          locationName: cajoncito?.nombre || 'Unknown',
          locationCode: cajoncito?.codigo || '',
          quantity: assoc.cantidad,
          locationPath: locationPath || 'Unknown',
        };
      });

    const totalStock = locationStocks.reduce((sum, loc) => sum + loc.quantity, 0);

    return {
      itemId: componente.id,
      itemType: 'componente',
      itemName: componente.descripcion,
      itemCode: `${componente.categoria}-${componente.id}`,
      totalStock,
      locations: locationStocks,
      isLowStock: false, // Componentes don't have low stock thresholds
    };
  }

  /**
   * Get distributed stock for multiple items
   */
  static async getDistributedStock(
    itemIds: string[],
    itemType: 'repuesto' | 'componente',
    options: StockCalculationOptions = {}
  ): Promise<DistributedStock[]> {
    const results: DistributedStock[] = [];

    for (const itemId of itemIds) {
      try {
        if (itemType === 'repuesto') {
          const stock = await this.calculateRepuestoStock(itemId, options);
          results.push(stock);
        } else {
          const stock = await this.calculateComponenteStock(itemId, options);
          results.push(stock);
        }
      } catch (error) {
        console.error(`Error calculating stock for ${itemType} ${itemId}:`, error);
        // Continue with other items
      }
    }

    return results;
  }

  /**
   * Get low stock items for repuestos
   */
  static async getLowStockItems(
    options: StockCalculationOptions = {}
  ): Promise<DistributedStock[]> {
    const { includeInactiveItems = false } = options;

    // Get all repuestos with stockMinimo threshold
    const repuestos = await prisma.repuesto.findMany({
      where: {
        stockMinimo: { gt: 0 },
        ...(includeInactiveItems ? {} : { isActive: true })
      },
      select: { id: true }
    });

    const itemIds = repuestos.map(r => r.id);
    const distributedStocks = await this.getDistributedStock(itemIds, 'repuesto', options);

    // Filter items that are below threshold
    return distributedStocks.filter(stock => stock.isLowStock);
  }

  /**
   * Recalculate stock for all items (useful for data integrity checks)
   */
  static async recalculateAllStock(
    itemType: 'repuesto' | 'componente' | 'all' = 'all',
    options: StockCalculationOptions = {}
  ): Promise<{
    repuestos: DistributedStock[];
    componentes: DistributedStock[];
    summary: {
      totalRepuestos: number;
      totalComponentes: number;
      lowStockRepuestos: number;
      totalValueRepuestos: number;
    };
  }> {
    const result = {
      repuestos: [] as DistributedStock[],
      componentes: [] as DistributedStock[],
      summary: {
        totalRepuestos: 0,
        totalComponentes: 0,
        lowStockRepuestos: 0,
        totalValueRepuestos: 0,
      }
    };

    if (itemType === 'repuesto' || itemType === 'all') {
      const repuestos = await prisma.repuesto.findMany({
        where: options.includeInactiveItems ? {} : { isActive: true },
        select: { id: true }
      });

      const repuestoIds = repuestos.map(r => r.id);
      result.repuestos = await this.getDistributedStock(repuestoIds, 'repuesto', options);
      result.summary.totalRepuestos = result.repuestos.length;
      result.summary.lowStockRepuestos = result.repuestos.filter(r => r.isLowStock).length;
    }

    if (itemType === 'componente' || itemType === 'all') {
      const componentes = await prisma.componente.findMany({
        where: options.includeInactiveItems ? {} : { isActive: true },
        select: { id: true }
      });

      const componenteIds = componentes.map(c => c.id);
      result.componentes = await this.getDistributedStock(componenteIds, 'componente', options);
      result.summary.totalComponentes = result.componentes.length;
    }

    return result;
  }

  /**
   * Get stock statistics for a location
   */
  static async getLocationStockStats(
    locationId: string,
    locationType: string,
    options: StockCalculationOptions = {}
  ): Promise<{
    totalItems: number;
    totalRepuestos: number;
    totalComponentes: number;
    repuestoTypes: Record<string, number>;
    componenteTypes: Record<string, number>;
  }> {
    const { includeZeroQuantities = false } = options;

    let repuestosCount = 0;
    let componentesCount = 0;
    const repuestoTypes: Record<string, number> = {};
    const componenteTypes: Record<string, number> = {};

    if (locationType === 'ubicacion') {
      // For ubicacion level, check all child locations
      // This would need recursive implementation similar to the location contents API
      // For now, we'll implement a basic version
    }

    // Calculate stock based on location type
    switch (locationType) {
      case 'armario':
        const armarioRepuestos = await prisma.repuestoUbicacion.findMany({
          where: { armarioId: locationId },
          include: {
            repuesto: {
              select: { categoria: true, isActive: true }
            }
          }
        });

        for (const assoc of armarioRepuestos) {
          if (assoc.repuesto.isActive || options.includeInactiveItems) {
            if (includeZeroQuantities || assoc.cantidad > 0) {
              repuestosCount += assoc.cantidad;
              const category = assoc.repuesto.categoria || 'Sin categoría';
              repuestoTypes[category] = (repuestoTypes[category] || 0) + assoc.cantidad;
            }
          }
        }
        break;

      case 'cajoncito':
        const cajoncitoComponentes = await prisma.componenteUbicacion.findMany({
          where: { cajoncitoId: locationId },
          include: {
            componente: {
              select: { categoria: true, isActive: true }
            }
          }
        });

        for (const assoc of cajoncitoComponentes) {
          if (assoc.componente.isActive || options.includeInactiveItems) {
            if (includeZeroQuantities || assoc.cantidad > 0) {
              componentesCount += assoc.cantidad;
              const category = assoc.componente.categoria || 'Sin categoría';
              componenteTypes[category] = (componenteTypes[category] || 0) + assoc.cantidad;
            }
          }
        }
        break;

      // Add more cases for other location types...
    }

    return {
      totalItems: repuestosCount + componentesCount,
      totalRepuestos: repuestosCount,
      totalComponentes: componentesCount,
      repuestoTypes,
      componenteTypes,
    };
  }
}