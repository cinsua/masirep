"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DrawerGrid, Cajon, Division } from "@/components/ubicaciones";
import { CajonForm } from "@/components/ubicaciones/cajon-form";
import {
  Search,
  Plus,
  ArrowLeft,
  Archive,
  Layers,
  Home,
} from "lucide-react";

interface Armario {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  ubicacionId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    cajones: number;
    organizadores: number;
    repuestos: number;
  };
}

interface Ubicacion {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  isActive: boolean;
}

interface CajonFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  estanteriaId?: string;
  armarioId?: string;
}

export const dynamic = 'force-dynamic';

export default function CajonesPage() {
  const params = useParams();
  const router = useRouter();
  const ubicacionId = params.id as string;
  const armarioId = params.armarioId as string;

  const [armario, setArmario] = useState<Armario | null>(null);
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [cajones, setCajones] = useState<Cajon[]>([]);
  const [divisions, setDivisions] = useState<Record<string, Division[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cajonFormOpen, setCajonFormOpen] = useState(false);
  const [editingCajon, setEditingCajon] = useState<Cajon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (armarioId) {
      fetchArmarioDetails();
      fetchCajones();
    }
  }, [armarioId, search]);

  const fetchArmarioDetails = async () => {
    try {
      const response = await fetch(`/api/armarios/${armarioId}`);
      const result = await response.json();

      if (result.success) {
        setArmario(result.data.armario);
        setUbicacion(result.data.ubicacion);
      } else {
        console.error("Error fetching armario:", result.error);
      }
    } catch (error) {
      console.error("Error fetching armario:", error);
    }
  };

  const fetchCajones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/armarios/${armarioId}/cajones${search ? `?search=${search}` : ""}`);
      const result = await response.json();

      if (result.success) {
        setCajones(result.data.cajones);

        // Fetch divisions for each cajon
        const divisionsData: Record<string, Division[]> = {};
        await Promise.all(
          result.data.cajones.map(async (cajon: Cajon) => {
            try {
              const divisionsResponse = await fetch(`/api/cajones/${cajon.id}/divisiones`);
              const divisionsResult = await divisionsResponse.json();
              if (divisionsResult.success) {
                divisionsData[cajon.id] = divisionsResult.data.divisiones;
              }
            } catch (error) {
              console.error(`Error fetching divisions for cajon ${cajon.id}:`, error);
              divisionsData[cajon.id] = [];
            }
          })
        );
        setDivisions(divisionsData);
      } else {
        console.error("Error fetching cajones:", result.error);
      }
    } catch (error) {
      console.error("Error fetching cajones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCajon = () => {
    setEditingCajon(null);
    setCajonFormOpen(true);
  };

  const handleEditCajon = (cajon: Cajon) => {
    setEditingCajon(cajon);
    setCajonFormOpen(true);
  };

  const handleDeleteCajon = async (cajon: Cajon) => {
    try {
      const response = await fetch(`/api/cajones/${cajon.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchCajones(); // Refresh the list
      } else {
        console.error("Error deleting cajon:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting cajon:", error);
      alert("Error al eliminar el cajón");
    }
  };

  const handleCajonSubmit = async (data: CajonFormData) => {
    try {
      setIsSubmitting(true);
      const url = editingCajon
        ? `/api/cajones/${editingCajon.id}`
        : `/api/armarios/${armarioId}/cajones`;

      const response = await fetch(url, {
        method: editingCajon ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        await fetchCajones(); // Refresh the list
        setCajonFormOpen(false);
        setEditingCajon(null);
      } else {
        console.error("Error saving cajon:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving cajon:", error);
      alert("Error al guardar el cajón");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCajonClick = (cajon: Cajon) => {
    // TODO: Implement cajon detail view (modal or expand in place)
    console.log("Cajon clicked:", cajon);
  };

  if (loading && !armario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!armario) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Armario no encontrado
          </h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/ubicaciones/${ubicacionId}`)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <div className="flex items-center space-x-2">
                <Home className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {ubicacion?.codigo} - {ubicacion?.nombre}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Archive className="h-6 w-6 text-gray-600" />
                {armario.codigo} - {armario.nombre}
              </h1>
              {armario.descripcion && (
                <p className="text-gray-600 mt-1">{armario.descripcion}</p>
              )}
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cajones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleAddCajon} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Cajón
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Cajones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {cajones.length}
              </div>
              <p className="text-sm text-gray-500">
                Total en este armario
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Divisiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {cajones.reduce((acc, c) => acc + c._count.divisiones, 0)}
              </div>
              <p className="text-sm text-gray-500">
                Total divisiones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {cajones.reduce((acc, c) => acc + c._count.repuestos, 0)}
              </div>
              <p className="text-sm text-gray-500">
                Repuestos directos en cajones
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cajones Grid */}
      <DrawerGrid
        cajones={cajones}
        divisions={divisions}
        loading={loading}
        onCajonClick={handleCajonClick}
        onAddCajon={handleAddCajon}
        onEditCajon={handleEditCajon}
        onDeleteCajon={handleDeleteCajon}
        showActions={true}
      />

      {/* Cajon Form Dialog */}
      <CajonForm
        isOpen={cajonFormOpen}
        onClose={() => {
          setCajonFormOpen(false);
          setEditingCajon(null);
        }}
        onSubmit={handleCajonSubmit}
        initialData={editingCajon || undefined}
        title={editingCajon ? "Editar Cajón" : "Nuevo Cajón"}
        description={
          editingCajon
            ? "Modifica los datos del cajón"
            : "Agrega un nuevo cajón a este armario"
        }
        parentType="armario"
        parentId={armarioId}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}