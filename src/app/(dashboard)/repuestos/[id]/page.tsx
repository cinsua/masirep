"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, MapPin, Package, Trash2, Wrench } from "lucide-react";
import { RepuestoWithRelations } from "@/types/api";
import { createDebugAttributes } from "@/lib/debug-attributes";
import { RepuestoForm } from "@/components/repuestos/repuesto-form";

const CATEGORIA_LABELS = {
  ELECTRICO: "Eléctrico",
  MECANICO: "Mecánico",
  ELECTRONICO: "Electrónico",
  HIDRAULICO: "Hidráulico",
  NEUMATICO: "Neumático",
  OTROS: "Otros",
};

const CATEGORIA_COLORS = {
  ELECTRICO: "bg-yellow-100 text-yellow-800",
  MECANICO: "bg-blue-100 text-blue-800",
  ELECTRONICO: "bg-green-100 text-green-800",
  HIDRAULICO: "bg-red-100 text-red-800",
  NEUMATICO: "bg-purple-100 text-purple-800",
  OTROS: "bg-gray-100 text-gray-800",
};

export default function RepuestoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [repuesto, setRepuesto] = useState<RepuestoWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const repuestoId = params.id as string;
  const editMode = searchParams.get('edit') === 'true';

  useEffect(() => {
    const fetchRepuesto = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/repuestos/${repuestoId}`);
        const result = await response.json();

        if (result.success) {
          setRepuesto(result.data);
          setIsEditMode(editMode);
        } else {
          setError(result.error || "Error al cargar el repuesto");
        }
      } catch (error) {
        console.error("Error fetching repuesto:", error);
        setError("Error de conexión al cargar el repuesto");
      } finally {
        setLoading(false);
      }
    };

    if (repuestoId) {
      fetchRepuesto();
    }
  }, [repuestoId, editMode]);

  const handleEdit = () => {
    router.push(`/repuestos/${repuestoId}?edit=true`);
  };

  const handleFormSubmit = async (data: any) => {
    if (!repuesto) return;

    try {
      const response = await fetch(`/api/repuestos/${repuesto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert("Repuesto actualizado exitosamente");
        // Refetch updated repuesto
        const updatedResponse = await fetch(`/api/repuestos/${repuestoId}`);
        const updatedResult = await updatedResponse.json();
        if (updatedResult.success) {
          setRepuesto(updatedResult.data);
        }
        setIsEditMode(false);
        router.replace(`/repuestos/${repuestoId}`);
      } else {
        const errorMessage = result.details
          ? result.details.join("\n")
          : result.error || "Error desconocido";
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error updating repuesto:", error);
      alert("Error de conexión al actualizar repuesto");
    }
  };

  const handleDelete = async () => {
    if (!repuesto) return;

    if (!confirm(`¿Está seguro de que desea eliminar el repuesto "${repuesto.nombre}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/repuestos/${repuesto.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("Repuesto eliminado exitosamente");
        router.push("/repuestos");
      } else {
        alert(`Error al eliminar repuesto: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting repuesto:", error);
      alert("Error de conexión al eliminar repuesto");
    }
  };

  const getStockStatus = (repuesto: RepuestoWithRelations) => {
    const stockActual = repuesto.stockActual;
    const stockMinimo = repuesto.stockMinimo;

    if (stockActual === 0) {
      return { label: "Sin stock", color: "bg-red-100 text-red-800" };
    } else if (stockActual <= stockMinimo) {
      return { label: "Stock bajo", color: "bg-orange-100 text-orange-800" };
    } else {
      return { label: "En stock", color: "bg-green-100 text-green-800" };
    }
  };

  const formatLocationPath = (ubicacion: any) => {
    const parts = [];
    
    if (ubicacion.armario) {
      parts.push(`Armario: ${ubicacion.armario.codigo}`);
    }
    if (ubicacion.estanteria) {
      parts.push(`Estantería: ${ubicacion.estanteria.codigo}`);
    }
    if (ubicacion.estante) {
      parts.push(`Estante: ${ubicacion.estante.codigo}`);
    }
    if (ubicacion.cajon) {
      parts.push(`Cajón: ${ubicacion.cajon.codigo}`);
    }
    if (ubicacion.division) {
      parts.push(`División: ${ubicacion.division.codigo}`);
    }
    
    return parts.length > 0 ? parts.join(" → ") : "Ubicación no especificada";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="ml-4 text-gray-600">Cargando repuesto...</p>
        </div>
      </div>
    );
  }

  if (error || !repuesto) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p className="text-gray-500 mb-4">{error || "Repuesto no encontrado"}</p>
          <Button onClick={() => router.push("/repuestos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Repuestos
          </Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(repuesto);

  // Show edit form if in edit mode
  if (isEditMode && repuesto) {
    return (
      <div className="container mx-auto p-6">
        <RepuestoForm
          repuesto={repuesto}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsEditMode(false);
            router.replace(`/repuestos/${repuestoId}`);
          }}
          isLoading={loading}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" {...createDebugAttributes({componentName: 'RepuestoDetailPage', filePath: 'src/app/(dashboard)/repuestos/[id]/page.tsx'})}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/repuestos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl font-bold">Detalles del Repuesto</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Main Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Código</label>
                <p className="mt-1 font-mono text-base">{repuesto.codigo}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="mt-1 text-base font-medium">{repuesto.nombre}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p className="mt-1 text-base">{repuesto.descripcion || "Sin descripción"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Categoría</label>
                <div className="mt-1">
                  <Badge className={CATEGORIA_COLORS[repuesto.categoria as keyof typeof CATEGORIA_COLORS || "OTROS"]}>
                    {CATEGORIA_LABELS[repuesto.categoria as keyof typeof CATEGORIA_LABELS || "OTROS"]}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Stock</label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className={stockStatus.color}>
                    {stockStatus.label}: {repuesto.stockActual} unidades
                  </Badge>
                  <span className="text-sm text-gray-500">
                    (Mínimo: {repuesto.stockMinimo})
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Información Adicional</label>
                <div className="mt-1 space-y-1">
                  {repuesto.marca && <p><span className="font-medium">Marca:</span> {repuesto.marca}</p>}
                  {repuesto.modelo && <p><span className="font-medium">Modelo:</span> {repuesto.modelo}</p>}
                  {repuesto.numeroParte && <p><span className="font-medium">N° Parte:</span> {repuesto.numeroParte}</p>}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipos */}
      {repuesto.equipos && repuesto.equipos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Equipos que Usan este Repuesto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {repuesto.equipos.map((equipo) => (
                <div
                  key={equipo.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-lg">
                        {equipo.equipo.nombre}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Código: {equipo.equipo.codigo}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {equipo.equipo.codigo}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ubicaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicaciones de Almacenamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {repuesto.ubicaciones.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Este repuesto no tiene ubicaciones asignadas
            </p>
          ) : (
            <div className="space-y-3">
              {repuesto.ubicaciones.map((ubicacion) => (
                <div
                  key={ubicacion.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-lg">
                        {ubicacion.cantidad} unidades
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatLocationPath(ubicacion)}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {ubicacion.armario?.codigo || 
                       ubicacion.estanteria?.codigo || 
                       ubicacion.estante?.codigo || 
                       ubicacion.cajon?.codigo || 
                       ubicacion.division?.codigo || 
                       "Sin código"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-sm font-medium text-gray-500">ID del Repuesto</label>
              <p className="font-mono mt-1">{repuesto.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
              <p className="mt-1">
                {new Date(repuesto.createdAt).toLocaleString("es-MX")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Última Actualización</label>
              <p className="mt-1">
                {new Date(repuesto.updatedAt).toLocaleString("es-MX")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Estado</label>
              <p className="mt-1">
                <Badge className={repuesto.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {repuesto.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}