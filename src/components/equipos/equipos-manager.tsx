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

type View = "list" | "create" | "edit" | "detail" | "manage-repuestos";

export function EquiposManager() {
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

  const handleView = (equipo: EquipoWithRelations) => {
    setSelectedEquipo(equipo);
    setCurrentView("detail");
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

      const response = await fetch(`/api/equipos/${equipo.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setRefreshKey(prev => prev + 1);
        setCurrentView("list");
      } else {
        setError(data.error || "Error al eliminar equipo");
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

      const url = selectedEquipo
        ? `/api/equipos/${selectedEquipo.id}`
        : "/api/equipos";
      const method = selectedEquipo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setRefreshKey(prev => prev + 1);
        setCurrentView("list");
      } else {
        setError(result.error || "Error al guardar equipo");
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

      const response = await fetch(`/api/equipos/${selectedEquipo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repuestos: associations,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRefreshKey(prev => prev + 1);
        setCurrentView("list");
      } else {
        setError(data.error || "Error al actualizar asociaciones");
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
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onView={handleView}
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
            onBack={handleCancel}
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
    <div className="container mx-auto p-6">
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