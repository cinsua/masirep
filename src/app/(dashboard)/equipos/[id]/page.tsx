"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EquipoDetail } from "@/components/equipos/equipo-detail";
import { EquipoWithRelations } from "@/types/api";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EquipoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const equipoId = params.id as string;

  const [equipo, setEquipo] = useState<EquipoWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (equipoId) {
      fetchEquipoDetails();
    }
  }, [equipoId]);

  const fetchEquipoDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/equipos/${equipoId}`);
      const result = await response.json();

      if (result.success) {
        setEquipo(result.data);
      } else {
        setError(result.error || "Error al cargar los detalles del equipo");
      }
    } catch (error) {
      setError("Error de conexión al cargar el equipo");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // TODO: Implementar navegación a vista de edición
    console.log("Editar equipo:", equipoId);
  };

  const handleManageRepuestos = () => {
    // TODO: Implementar navegación a gestión de repuestos
    console.log("Gestionar repuestos del equipo:", equipoId);
  };

  const handleBack = () => {
    router.push("/equipos");
  };



  if (loading && !equipo) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground ml-2">Cargando equipo...</p>
        </div>
      </div>
    );
  }

  if (!equipo) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <EntityIcon entityType="equipo" className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Equipo no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            No se encontró el equipo solicitado
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Equipos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <EquipoDetail
        equipo={equipo}
        onEdit={handleEdit}
        onManageRepuestos={handleManageRepuestos}
      />
    </div>
  );
}