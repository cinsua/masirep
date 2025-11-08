"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DrawerGrid, Cajon, Division, OrganizerGrid, Organizador, Cajoncito, OrganizadorForm } from "@/components/ubicaciones";
import { CajonForm } from "@/components/ubicaciones/cajon-form";
import {
  Plus,
  Archive,
  Layers,
  Home,
  Package,
  Grid3X3,
  ArrowLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Armario {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  ubicacionId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
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

interface OrganizadorFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  armarioId?: string;
  cantidadCajoncitos: number;
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
  const [organizadores, setOrganizadores] = useState<Organizador[]>([]);
  const [cajoncitos, setCajoncitos] = useState<Record<string, Cajoncito[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cajones");
  const [cajonFormOpen, setCajonFormOpen] = useState(false);
  const [editingCajon, setEditingCajon] = useState<Cajon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizadorFormOpen, setOrganizadorFormOpen] = useState(false);
  const [editingOrganizador, setEditingOrganizador] = useState<Organizador | null>(null);

  useEffect(() => {
    if (armarioId) {
      fetchArmarioDetails();
      fetchCajones();
      fetchOrganizadores();
    }
  }, [armarioId]);

  
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
      const response = await fetch(`/api/armarios/${armarioId}/cajones`);
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

  const fetchOrganizadores = async () => {
    try {
      const response = await fetch(`/api/armarios/${armarioId}/organizadores`);
      const result = await response.json();

      if (result.success) {
        setOrganizadores(result.data.organizadores);

        // Fetch cajoncitos for each organizador
        const cajoncitosData: Record<string, Cajoncito[]> = {};
        await Promise.all(
          result.data.organizadores.map(async (organizador: Organizador) => {
            try {
              const cajoncitosResponse = await fetch(`/api/organizadores/${organizador.id}/cajoncitos`);
              const cajoncitosResult = await cajoncitosResponse.json();
              if (cajoncitosResult.success) {
                cajoncitosData[organizador.id] = cajoncitosResult.data.cajoncitos;
              }
            } catch (error) {
              console.error(`Error fetching cajoncitos for organizador ${organizador.id}:`, error);
              cajoncitosData[organizador.id] = [];
            }
          })
        );
        setCajoncitos(cajoncitosData);
      } else {
        console.error("Error fetching organizadores:", result.error);
      }
    } catch (error) {
      console.error("Error fetching organizadores:", error);
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

  const handleAddOrganizador = () => {
    setEditingOrganizador(null);
    setOrganizadorFormOpen(true);
  };

  const handleEditOrganizador = (organizador: Organizador) => {
    setEditingOrganizador(organizador);
    setOrganizadorFormOpen(true);
  };

  const handleDeleteOrganizador = async (organizador: Organizador) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el organizador ${organizador.codigo}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/organizadores/${organizador.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchOrganizadores(); // Refresh the list
      } else {
        console.error("Error deleting organizador:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting organizador:", error);
      alert("Error al eliminar el organizador");
    }
  };

  const handleOrganizadorClick = (organizador: Organizador) => {
    // Navigate to organizador detail view
    router.push(`/ubicaciones/${ubicacionId}/armarios/${armarioId}/organizadores/${organizador.id}`);
  };

  const handleCajoncitoClick = (cajoncito: Cajoncito) => {
    // Navigate to cajoncito detail view
    console.log("Cajoncito clicked:", cajoncito);
  };

  
  const handleOrganizadorSubmit = async (data: OrganizadorFormData) => {
    try {
      setIsSubmitting(true);
      const url = editingOrganizador
        ? `/api/organizadores/${editingOrganizador.id}`
        : `/api/armarios/${armarioId}/organizadores`;

      const response = await fetch(url, {
        method: editingOrganizador ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        await fetchOrganizadores(); // Refresh the list
        setOrganizadorFormOpen(false);
        setEditingOrganizador(null);
      } else {
        console.error("Error saving organizador:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving organizador:", error);
      alert("Error al guardar el organizador");
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="flex gap-2">
            {activeTab === "cajones" && (
              <Button onClick={handleAddCajon} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Cajón
              </Button>
            )}
            {activeTab === "organizadores" && (
              <Button onClick={handleAddOrganizador} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Organizador
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
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
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Organizadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {organizadores.length}
              </div>
              <p className="text-sm text-gray-500">
                Total organizadores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {cajones.reduce((acc, c) => acc + c._count.repuestos, 0) +
                 Object.values(cajoncitos).flat().reduce((acc, c) => acc + c._count.componentes, 0)}
              </div>
              <p className="text-sm text-gray-500">
                Items almacenados
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for Cajones and Organizadores */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cajones" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Cajones ({cajones.length})
          </TabsTrigger>
          <TabsTrigger value="organizadores" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Organizadores ({organizadores.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cajones" className="mt-6">
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
        </TabsContent>

        <TabsContent value="organizadores" className="mt-6">
          <OrganizerGrid
            organizadores={organizadores}
            cajoncitos={cajoncitos}
            loading={loading}
            onOrganizadorClick={handleOrganizadorClick}
            onCajoncitoClick={handleCajoncitoClick}
            onAddOrganizador={handleAddOrganizador}
            onEditOrganizador={handleEditOrganizador}
            onDeleteOrganizador={handleDeleteOrganizador}
            showActions={true}
          />
        </TabsContent>
      </Tabs>

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

      {/* Organizador Form Dialog */}
      <OrganizadorForm
        isOpen={organizadorFormOpen}
        onClose={() => {
          setOrganizadorFormOpen(false);
          setEditingOrganizador(null);
        }}
        onSubmit={handleOrganizadorSubmit}
        initialData={editingOrganizador || undefined}
        title={editingOrganizador ? "Editar Organizador" : "Nuevo Organizador"}
        description={
          editingOrganizador
            ? "Modifica los datos del organizador"
            : "Agrega un nuevo organizador a este armario con cajoncitos fijos"
        }
        parentType="armario"
        parentId={armarioId}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}