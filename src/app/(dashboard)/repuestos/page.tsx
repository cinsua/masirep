"use client";

import { useState } from "react";
import { RepuestoList } from "@/components/repuestos/repuesto-list";
import { RepuestoForm } from "@/components/repuestos/repuesto-form";
import { RepuestoDetail } from "@/components/repuestos/repuesto-detail";
import { RepuestoWithRelations, RepuestoCreateInput, RepuestoUpdateInput } from "@/types/api";

type ViewMode = "list" | "create" | "edit" | "detail";

export default function RepuestosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRepuesto, setSelectedRepuesto] = useState<RepuestoWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNew = () => {
    setSelectedRepuesto(null);
    setViewMode("create");
  };

  const handleEdit = (repuesto: RepuestoWithRelations) => {
    setSelectedRepuesto(repuesto);
    setViewMode("edit");
  };

  const handleView = (repuesto: RepuestoWithRelations) => {
    setSelectedRepuesto(repuesto);
    setViewMode("detail");
  };

  const handleDelete = async (repuesto: RepuestoWithRelations) => {
    if (!confirm(`¿Está seguro de que desea eliminar el repuesto "${repuesto.nombre}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/repuestos/${repuesto.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setViewMode("list");
        // Force refresh by triggering a re-render
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Error al eliminar: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting repuesto:", error);
      alert("Error al eliminar el repuesto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: RepuestoCreateInput | RepuestoUpdateInput) => {
    try {
      setIsLoading(true);
      const url = selectedRepuesto 
        ? `/api/repuestos/${selectedRepuesto.id}`
        : "/api/repuestos";
      
      const method = selectedRepuesto ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setViewMode("list");
        // Force refresh by triggering a re-render
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving repuesto:", error);
      alert("Error al guardar el repuesto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedRepuesto(null);
  };

  const handleBack = () => {
    setViewMode("list");
  };

  // Force dynamic rendering to avoid build-time static generation issues
  // export const dynamic = 'force-dynamic';

  return (
    <div className="container mx-auto py-6">
      {viewMode === "list" && (
        <RepuestoList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}
      
      {(viewMode === "create" || viewMode === "edit") && (
        <RepuestoForm
          repuesto={selectedRepuesto || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
      
      {viewMode === "detail" && selectedRepuesto && (
        <RepuestoDetail
          repuesto={selectedRepuesto}
          onEdit={handleEdit}
          onBack={handleBack}
        />
      )}
    </div>
  );
}