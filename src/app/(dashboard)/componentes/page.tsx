"use client";

import { useState, useCallback } from "react";
import { ComponenteList } from "@/components/componentes/componente-list";
import { ComponenteForm } from "@/components/componentes/componente-form";
import { ComponenteDetail } from "@/components/componentes/componente-detail";
import { ComponenteWithRelations } from "@/types/api";
import { validateComponente } from "@/lib/validations/componente";

// Force dynamic rendering to avoid build-time static generation issues
export const dynamic = 'force-dynamic';

type View = "list" | "form" | "detail";

export default function ComponentesPage() {
  const [view, setView] = useState<View>("list");
  const [selectedComponente, setSelectedComponente] = useState<ComponenteWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNew = useCallback(() => {
    setSelectedComponente(null);
    setView("form");
  }, []);

  const handleEdit = useCallback((componente: ComponenteWithRelations) => {
    setSelectedComponente(componente);
    setView("form");
  }, []);

  const handleView = useCallback((componente: ComponenteWithRelations) => {
    setSelectedComponente(componente);
    setView("detail");
  }, []);

  const handleDelete = useCallback(async (componente: ComponenteWithRelations) => {
    if (!confirm(`¿Está seguro de que desea eliminar el componente "${componente.descripcion}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/componentes/${componente.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("Componente eliminado exitosamente");
        setView("list");
        // Refresh list by navigating away and back (simple refresh)
        window.location.reload();
      } else {
        alert(`Error al eliminar componente: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting componente:", error);
      alert("Error de conexión al eliminar componente");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFormSubmit = useCallback(async (data: any) => {
    try {
      setIsLoading(true);

      const url = selectedComponente
        ? `/api/componentes/${selectedComponente.id}`
        : "/api/componentes";

      const method = selectedComponente ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert(selectedComponente ? "Componente actualizado exitosamente" : "Componente creado exitosamente");
        setView("list");
        // Refresh list by navigating away and back (simple refresh)
        window.location.reload();
      } else {
        const errorMessage = result.details
          ? result.details.join("\n")
          : result.error || "Error desconocido";
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error saving componente:", error);
      alert("Error de conexión al guardar componente");
    } finally {
      setIsLoading(false);
    }
  }, [selectedComponente]);

  const handleFormCancel = useCallback(() => {
    setView("list");
    setSelectedComponente(null);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">Componentes Electrónicos</h1>
        <div className="text-sm text-gray-500">
          Gestión de componentes electrónicos con especificaciones técnicas
        </div>
      </div>

      {view === "list" && (
        <ComponenteList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}

      {view === "form" && (
        <ComponenteForm
          componente={selectedComponente || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isLoading}
        />
      )}

      {view === "detail" && selectedComponente && (
        <ComponenteDetail
          componente={selectedComponente}
          onEdit={handleEdit}
          onBack={() => setView("list")}
        />
      )}
    </div>
  );
}