"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocationCard, StorageTree, ArmarioForm, EstanteriaForm } from "@/components/ubicaciones";
import {
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

  const [viewMode, setViewMode] = useState<"grid" | "tree">("grid");
  const [isArmarioFormOpen, setIsArmarioFormOpen] = useState(false);
  const [isEstanteriaFormOpen, setIsEstanteriaFormOpen] = useState(false);
  const [editingArmario, setEditingArmario] = useState<Armario | null>(null);
  const [editingEstanteria, setEditingEstanteria] = useState<Estanteria | null>(null);

  useEffect(() => {
    if (ubicacionId) {
      fetchUbicacionDetails();
      fetchArmarios();
      fetchEstanterias();
    }
  }, [ubicacionId]);

  
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
      const response = await fetch(`/api/ubicaciones/${ubicacionId}/armarios`);
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
      const response = await fetch(`/api/ubicaciones/${ubicacionId}/estanterias`);
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



  const handleNavigateToArmario = (armario: Armario) => {
    router.push(`/ubicaciones/${ubicacionId}/armarios/${armario.id}/cajones`);
  };

  const handleNavigateToEstanteria = (estanteria: Estanteria) => {
    router.push(`/ubicaciones/${ubicacionId}/estanterias/${estanteria.id}/cajones`);
  };

  
  const handleCreateArmario = () => {
    setEditingArmario(null);
    setIsArmarioFormOpen(true);
  };

  const handleCreateEstanteria = () => {
    setEditingEstanteria(null);
    setIsEstanteriaFormOpen(true);
  };



  const handleEditArmario = (armario: Armario) => {
    setEditingArmario(armario);
    setIsArmarioFormOpen(true);
  };

  const handleEditEstanteria = (estanteria: Estanteria) => {
    setEditingEstanteria(estanteria);
    setIsEstanteriaFormOpen(true);
  };

  const handleDeleteArmario = async (armario: Armario) => {
    if (armario._count.cajones > 0 || armario._count.organizadores > 0 || armario._count.repuestos > 0) {
      alert("No se puede eliminar el armario porque contiene cajones, organizadores o repuestos asociados");
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar el armario "${armario.nombre}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ubicaciones/${ubicacionId}/armarios/${armario.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchArmarios();
      } else {
        alert(`Error al eliminar armario: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting armario:", error);
      alert("Error al eliminar el armario");
    }
  };

  const handleDeleteEstanteria = async (estanteria: Estanteria) => {
    if (estanteria._count.cajones > 0 || estanteria._count.estantes > 0 || estanteria._count.organizadores > 0 || estanteria._count.repuestos > 0) {
      alert("No se puede eliminar la estantería porque contiene cajones, estantes, organizadores o repuestos asociados");
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar la estantería "${estanteria.nombre}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ubicaciones/${ubicacionId}/estanterias/${estanteria.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchEstanterias();
      } else {
        alert(`Error al eliminar estantería: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting estanteria:", error);
      alert("Error al eliminar la estantería");
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
    <div
      className="container mx-auto p-6 space-y-6"
      data-ai-tag="ubicacion-detail-page"
      data-ai-component="ubicaciones-detail"
      data-ai-ubicacion-id={ubicacionId}
    >
      {/* Header */}
      <div className="flex flex-col gap-4" data-ai-tag="page-header">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="h-8 w-8" />
              {ubicacion.nombre}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {ubicacion.descripcion && (
                <span className="text-muted-foreground">{ubicacion.descripcion}</span>
              )}
              {!ubicacion.isActive && (
                <Badge variant="destructive">Inactiva</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateArmario}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Armario
            </Button>
            <Button variant="outline" onClick={handleCreateEstanteria}>
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
                          cajonesCount={armario._count.cajones}
                          onClick={() => handleNavigateToArmario(armario)}
                          onEdit={() => handleEditArmario(armario)}
                          onDelete={() => handleDeleteArmario(armario)}
                          showActions={true}
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
                          cajonesCount={estanteria._count.cajones}
                          estanteriasCount={estanteria._count.estantes}
                          onClick={() => handleNavigateToEstanteria(estanteria)}
                          onEdit={() => handleEditEstanteria(estanteria)}
                          onDelete={() => handleDeleteEstanteria(estanteria)}
                          showActions={true}
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
                    <Button onClick={handleCreateArmario}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Armario
                    </Button>
                    <Button variant="outline" onClick={handleCreateEstanteria}>
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

      {/* Armario Form Modal */}
      <ArmarioForm
        isOpen={isArmarioFormOpen}
        onClose={() => {
          setIsArmarioFormOpen(false);
          setEditingArmario(null);
        }}
        onSubmit={async (formData: any) => {
          const url = editingArmario
            ? `/api/ubicaciones/${ubicacionId}/armarios/${editingArmario.id}`
            : `/api/ubicaciones/${ubicacionId}/armarios`;

          const method = editingArmario ? "PUT" : "POST";

          const response = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(editingArmario ? formData : formData),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || `Error al ${editingArmario ? 'editar' : 'crear'} el armario`);
          }

          await fetchArmarios();
          setIsArmarioFormOpen(false);
          setEditingArmario(null);
        }}
        initialData={editingArmario ? {
          codigo: editingArmario.codigo,
          nombre: editingArmario.nombre,
          descripcion: editingArmario.descripcion,
          isActive: editingArmario.isActive,
        } : undefined}
        ubicacionCodigo={ubicacion?.codigo}
        ubicacionId={ubicacionId}
        title={editingArmario ? "Editar Armario" : "Nuevo Armario"}
        description={editingArmario
          ? "Edita los datos del armario seleccionado"
          : "Crea un nuevo armario en esta ubicación"
        }
      />

      {/* Estanteria Form Modal */}
      <EstanteriaForm
        isOpen={isEstanteriaFormOpen}
        onClose={() => {
          setIsEstanteriaFormOpen(false);
          setEditingEstanteria(null);
        }}
        onSubmit={async (formData: any) => {
          const url = editingEstanteria
            ? `/api/ubicaciones/${ubicacionId}/estanterias/${editingEstanteria.id}`
            : `/api/ubicaciones/${ubicacionId}/estanterias`;

          const method = editingEstanteria ? "PUT" : "POST";

          const response = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(editingEstanteria ? formData : formData),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || `Error al ${editingEstanteria ? 'editar' : 'crear'} la estantería`);
          }

          await fetchEstanterias();
          setIsEstanteriaFormOpen(false);
          setEditingEstanteria(null);
        }}
        initialData={editingEstanteria ? {
          codigo: editingEstanteria.codigo,
          nombre: editingEstanteria.nombre,
          descripcion: editingEstanteria.descripcion,
          isActive: editingEstanteria.isActive,
        } : undefined}
        ubicacionCodigo={ubicacion?.codigo}
        ubicacionId={ubicacionId}
        title={editingEstanteria ? "Editar Estantería" : "Nueva Estantería"}
        description={editingEstanteria
          ? "Edita los datos de la estantería seleccionada"
          : "Crea una nueva estantería en esta ubicación"
        }
      />
    </div>
  );
}