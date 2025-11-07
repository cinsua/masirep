"use client";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ComponenteCategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CATEGORIA_LABELS = {
  RESISTENCIA: "Resistencia",
  CAPACITOR: "Capacitor",
  INTEGRADO: "Circuito Integrado",
  VENTILADOR: "Ventilador",
  OTROS: "Otros",
};

const CATEGORIA_COLORS = {
  RESISTENCIA: "bg-red-100 text-red-800",
  CAPACITOR: "bg-blue-100 text-blue-800",
  INTEGRADO: "bg-green-100 text-green-800",
  VENTILADOR: "bg-yellow-100 text-yellow-800",
  OTROS: "bg-gray-100 text-gray-800",
};

const CATEGORIA_DESCRIPTIONS = {
  RESISTENCIA: "Resistencias, potenciómetros y otros componentes resistivos",
  CAPACITOR: "Capacitores electrolíticos, cerámicos, de tantalio, etc.",
  INTEGRADO: "Circuitos integrados, microcontroladores, procesadores",
  VENTILADOR: "Ventiladores, disipadores y componentes de refrigeración",
  OTROS: "Componentes que no encajan en otras categorías",
};

export function ComponenteCategorySelector({ value, onChange, disabled = false }: ComponenteCategorySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="categoria">Categoría</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Seleccionar categoría</option>
        {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      {value && (
        <p className="text-sm text-gray-600">
          {CATEGORIA_DESCRIPTIONS[value as keyof typeof CATEGORIA_DESCRIPTIONS]}
        </p>
      )}
    </div>
  );
}