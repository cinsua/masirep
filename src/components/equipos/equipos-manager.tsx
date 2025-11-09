"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wrench, ArrowLeft, Plus, Edit, Eye, Trash2, AlertCircle } from "lucide-react";
import { EquipoList } from "./equipo-list";
import { EquipoForm } from "./equipo-form";
import { EquipoDetail } from "./equipo-detail";
import { EquipoRepuestoManager } from "./equipo-repuesto-manager";
import { EquipoWithRelations } from "@/types/api";
import { EquipoFormData } from "@/lib/validations/equipo";
import { createDebugAttributes } from "@/lib/debug-attributes";
import { useEquipos } from "@/hooks/use-equipos";

type View = "list" | "create" | "edit" | "detail" | "manage-repuestos";

export function EquiposManager() {
  const { data: equipos, delete: deleteEquipo, create: createEquipo, update: updateEquipo } = useEquipos();
  const [currentView, setCurrentView] = useState<View>("list");
  const [selectedEquipo, setSelectedEquipo] = useState<EquipoWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setError(null);
  }, [currentView]);

  const handleCreateNew = () => {
    setSelectedEquipo(null);
    setCurrentView("create");
  };

  const handleEdit = (equipo: EquipoWithRelations) => {
    setSelectedEquipo(equipo);
    setCurrentView("edit");
  };



  const handleManageRepuestos = (equipo: EquipoWithRelations) => {
    setSelectedEquipo(equipo);
    setCurrentView("manage-repuestos");
  };

const handleDelete = async (equipo: EquipoWithRelations) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el equipo "${equipo.nombre}" (${equipo.codigo})? Esta acción se puede deshacer.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const success = await deleteEquipo(equipo.id);

      if (success) {
        setRefreshKey(prev => prev + 1);
        setCurrentView("list");
      } else {
        setError("Error al eliminar equipo");
      }
    } catch (error) {
      setError("Error de conexión al eliminar equipo");
    } finally {
      setLoading(false);
    }
  };

const handleFormSubmit = async (data: EquipoFormData) => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (selectedEquipo) {
        result = await updateEquipo(selectedEquipo.id, data as Partial<EquipoWithRelations>);
      } else {
        result = await createEquipo(data as Partial<EquipoWithRelations>);
      }

      if (result) {
        setRefreshKey(prev => prev + 1);
        setCurrentView("list");
      } else {
        setError("Error al guardar equipo");
      }
    } catch (error) {
      setError("Error de conexión al guardar equipo");
    } finally {
      setLoading(false);
    }
  };

const handleSaveAssociations = async (associations: Array<{ repuestoId: string }>) => {
    if (!selectedEquipo) {
      setError("No se ha seleccionado ningún equipo");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await updateEquipo(selectedEquipo.id, {
        repuestos: associations as any,
      });

      if (result) {
        setRefreshKey(prev => prev + 1);
        setCurrentView("list");
      } else {
        setError("Error al actualizar asociaciones");
      }
    } catch (error) {
      setError("Error de conexión al actualizar asociaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedEquipo(null);
    setError(null);
  };

  const renderBackButton = () => {
    if (currentView === "list") return null;

    return (
      <Button
        variant="ghost"
        onClick={handleCancel}
        className="mb-4"
        disabled={loading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a la lista
      </Button>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case "list":
        return (
          <EquipoList
            key={refreshKey}
            equipos={equipos || []}
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );

      case "create":
        return (
          <EquipoForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isLoading={loading}
          />
        );

      case "edit":
        return selectedEquipo ? (
          <EquipoForm
            item={selectedEquipo}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isLoading={loading}
          />
        ) : null;

      case "detail":
        return selectedEquipo ? (
          <EquipoDetail
            equipo={selectedEquipo}
            onEdit={() => handleEdit(selectedEquipo)}
            onManageRepuestos={() => handleManageRepuestos(selectedEquipo)}
          />
        ) : null;

      case "manage-repuestos":
        return selectedEquipo ? (
          <EquipoRepuestoManager
            equipo={selectedEquipo}
            onSave={handleSaveAssociations}
            onCancel={handleCancel}
            isLoading={loading}
          />
        ) : null;

      default:
        return null;
    }
  };

return (
    <div className="container mx-auto p-6" {...createDebugAttributes({componentName: 'EquiposManager', filePath: 'src/components/equipos/equipos-manager.tsx'})}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {renderBackButton()}

      {loading && currentView !== "list" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Procesando...</span>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}