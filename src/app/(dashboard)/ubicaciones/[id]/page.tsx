"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LocationCard, StorageTree, BreadcrumbNavigation, BreadcrumbItem } from "@/components/ubicaciones";
import {
  Search,
  Plus,
  ArrowLeft,
  MapPin,
  Archive,
  Grid3x3,
  Home,
  Layers,
  Package,
} from "lucide-react";

interface Ubicacion {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    armarios: number;
    estanterias: number;
  };
}

interface Armario {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  ubicacionId: string;
  isActive: boolean;
  _count: {
    cajones: number;
    organizadores: number;
    repuestos: number;
  };
}

interface Estanteria {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  ubicacionId: string;
  isActive: boolean;
  _count: {
    cajones: number;
    estantes: number;
    organizadores: number;
    repuestos: number;
  };
}

// Force dynamic rendering to avoid build-time static generation issues
export const dynamic = 'force-dynamic';

export default function UbicacionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ubicacionId = params.id as string;

  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [armarios, setArmarios] = useState<Armario[]>([]);
  const [estanterias, setEstanterias] = useState<Estanteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "tree">("grid");
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    if (ubicacionId) {
      fetchUbicacionDetails();
      fetchArmarios();
      fetchEstanterias();
    }
  }, [ubicacionId]);

  useEffect(() => {
    if (ubicacion) {
      setBreadcrumbPath([
        {
          id: ubicacion.id,
          codigo: ubicacion.codigo,
          nombre: ubicacion.nombre,
          type: "ubicacion",
          isActive: ubicacion.isActive,
        },
      ]);
    }
  }, [ubicacion]);

  const fetchUbicacionDetails = async () => {
    try {
      const response = await fetch(`/api/ubicaciones/${ubicacionId}`);
      const result = await response.json();

      if (result.success) {
        setUbicacion(result.data);
      } else {
        console.error("Error fetching ubicacion:", result.error);
      }
    } catch (error) {
      console.error("Error fetching ubicacion:", error);
    }
  };

  const fetchArmarios = async () => {
    try {
      const response = await fetch(`/api/ubicaciones/${ubicacionId}/armarios${search ? `?search=${search}` : ""}`);
      const result = await response.json();

      if (result.success) {
        setArmarios(result.data.armarios);
      } else {
        console.error("Error fetching armarios:", result.error);
      }
    } catch (error) {
      console.error("Error fetching armarios:", error);
    }
  };

  const fetchEstanterias = async () => {
    try {
      const response = await fetch(`/api/ubicaciones/${ubicacionId}/estanterias${search ? `?search=${search}` : ""}`);
      const result = await response.json();

      if (result.success) {
        setEstanterias(result.data.estanterias);
      } else {
        console.error("Error fetching estanterias:", result.error);
      }
    } catch (error) {
      console.error("Error fetching estanterias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArmarios();
    fetchEstanterias();
  };

  const handleNavigateToArmario = (armario: Armario) => {
    router.push(`/ubicaciones/${ubicacionId}/armarios/${armario.id}/cajones`);
  };

  const handleNavigateToEstanteria = (estanteria: Estanteria) => {
    router.push(`/ubicaciones/${ubicacionId}/estanterias/${estanteria.id}/cajones`);
  };

  const handleBreadcrumbNavigate = (item: BreadcrumbItem, index: number) => {
    if (index === 0) {
      // Navigate back to main ubicaciones page
      router.push("/ubicaciones");
    }
  };

  const getTotalItems = () => {
    const armariosItems = armarios.reduce((total, armario) =>
      total + armario._count.repuestos, 0
    );
    const estanteriasItems = estanterias.reduce((total, estanteria) =>
      total + estanteria._count.repuestos, 0
    );
    return armariosItems + estanteriasItems;
  };

  // Prepare data for StorageTree component
  const storageTreeData = ubicacion ? [
    {
      id: ubicacion.id,
      codigo: ubicacion.codigo,
      nombre: ubicacion.nombre,
      descripcion: ubicacion.descripcion,
      isActive: ubicacion.isActive,
      type: "ubicacion" as const,
      armariosCount: ubicacion._count.armarios,
      estanteriasCount: ubicacion._count.estanterias,
      children: [
        ...armarios.map(armario => ({
          id: armario.id,
          codigo: armario.codigo,
          nombre: armario.nombre,
          descripcion: armario.descripcion,
          isActive: armario.isActive,
          type: "armario" as const,
          itemCount: armario._count.repuestos,
          children: [] // TODO: Load cajones and organizadores when those stories are implemented
        })),
        ...estanterias.map(estanteria => ({
          id: estanteria.id,
          codigo: estanteria.codigo,
          nombre: estanteria.nombre,
          descripcion: estanteria.descripcion,
          isActive: estanteria.isActive,
          type: "estanteria" as const,
          itemCount: estanteria._count.repuestos,
          children: [] // TODO: Load cajones, estantes, organizadores when those stories are implemented
        }))
      ]
    }
  ] : [];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground ml-2">Cargando ubicación...</p>
        </div>
      </div>
    );
  }

  if (!ubicacion) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Ubicación no encontrada</h3>
          <p className="text-muted-foreground mb-4">
            No se encontró la ubicación solicitada
          </p>
          <Button onClick={() => router.push("/ubicaciones")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Ubicaciones
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/ubicaciones")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </div>

        <BreadcrumbNavigation
          items={breadcrumbPath}
          onNavigate={handleBreadcrumbNavigate}
          showIcons={true}
          showTypes={true}
        />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="h-8 w-8" />
              {ubicacion.nombre}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="font-mono">
                {ubicacion.codigo}
              </Badge>
              {ubicacion.descripcion && (
                <span className="text-muted-foreground">{ubicacion.descripcion}</span>
              )}
              {!ubicacion.isActive && (
                <Badge variant="destructive">Inactiva</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Armario
            </Button>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Estantería
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armarios</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ubicacion._count.armarios}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estanterías</CardTitle>
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ubicacion._count.estanterias}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Totales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalItems()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unidades</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ubicacion._count.armarios + ubicacion._count.estanterias}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Mode */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">Unidades de Almacenamiento</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Vista de Tarjetas
              </Button>
              <Button
                variant={viewMode === "tree" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("tree")}
              >
                Vista de Árbol
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar armarios o estanterías..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>

          {viewMode === "tree" ? (
            <StorageTree
              data={storageTreeData}
              onNodeClick={(node) => {
                if (node.type === "armario") {
                  const armario = armarios.find(a => a.id === node.id);
                  if (armario) handleNavigateToArmario(armario);
                } else if (node.type === "estanteria") {
                  const estanteria = estanterias.find(e => e.id === node.id);
                  if (estanteria) handleNavigateToEstanteria(estanteria);
                }
              }}
              expandByDefault={true}
              showItemCount={true}
              maxDepth={2}
            />
          ) : (
            <div className="space-y-6">
              {/* Armarios Section */}
              {armarios.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Archive className="h-5 w-5 text-blue-600" />
                    Armarios ({armarios.length})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {armarios.map((armario) => (
                      <LocationCard
                        key={armario.id}
                        id={armario.id}
                        codigo={armario.codigo}
                        nombre={armario.nombre}
                        descripcion={armario.descripcion}
                        isActive={armario.isActive}
                        type="armario"
                        itemCount={armario._count.repuestos}
                        onClick={() => handleNavigateToArmario(armario)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Estanterías Section */}
              {estanterias.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Grid3x3 className="h-5 w-5 text-green-600" />
                    Estanterías ({estanterias.length})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {estanterias.map((estanteria) => (
                      <LocationCard
                        key={estanteria.id}
                        id={estanteria.id}
                        codigo={estanteria.codigo}
                        nombre={estanteria.nombre}
                        descripcion={estanteria.descripcion}
                        isActive={estanteria.isActive}
                        type="estanteria"
                        itemCount={estanteria._count.repuestos}
                        onClick={() => handleNavigateToEstanteria(estanteria)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {armarios.length === 0 && estanterias.length === 0 && (
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No hay unidades de almacenamiento</h3>
                  <p className="text-muted-foreground mb-4">
                    Esta ubicación aún no tiene armarios ni estanterías
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Armario
                    </Button>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Estantería
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}