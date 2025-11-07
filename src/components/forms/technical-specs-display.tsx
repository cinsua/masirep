"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Info } from "lucide-react";

interface ValorUnidadPair {
  valor: string;
  unidad: string;
}

interface TechnicalSpecsDisplayProps {
  valorUnidad: ValorUnidadPair[];
  categoria?: string;
  compact?: boolean;
  className?: string;
}

// Technical specifications grouping by category
const CATEGORIA_SPEC_LABELS = {
  RESISTENCIA: {
    title: "Especificaciones de Resistencia",
    icon: "Ω",
    commonSpecs: ["resistencia", "potencia", "tolerancia", "coeficiente"],
  },
  CAPACITOR: {
    title: "Especificaciones de Capacitor",
    icon: "F",
    commonSpecs: ["capacitancia", "voltaje", "tolerancia", "tipo"],
  },
  INTEGRADO: {
    title: "Especificaciones de Circuito Integrado",
    icon: "IC",
    commonSpecs: ["voltaje", "corriente", "frecuencia", "encapsulado"],
  },
  VENTILADOR: {
    title: "Especificaciones de Ventilación",
    icon: "🌀",
    commonSpecs: ["voltaje", "corriente", "velocidad", "flujo"],
  },
  OTROS: {
    title: "Especificaciones Técnicas",
    icon: "⚙️",
    commonSpecs: [],
  },
};

export function TechnicalSpecsDisplay({
  valorUnidad,
  categoria,
  compact = false,
  className = ""
}: TechnicalSpecsDisplayProps) {
  if (!valorUnidad || valorUnidad.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No hay especificaciones técnicas disponibles
      </div>
    );
  }

  const formatValorUnidad = (pair: ValorUnidadPair) => {
    return `${pair.valor} ${pair.unidad}`;
  };

  const getSpecType = (unidad: string) => {
    const unidadLower = unidad.toLowerCase();

    if (unidadLower.match(/[ωkkm]/)) return "Resistencia";
    if (unidadLower.match(/[fµnp]/)) return "Capacitancia";
    if (unidadLower.match(/v/)) return "Voltaje";
    if (unidadLower.match(/[amµn]/)) return "Corriente";
    if (unidadLower.match(/w/)) return "Potencia";
    if (unidadLower.match(/hz|khz|mhz|ghz/)) return "Frecuencia";
    if (unidadLower.match(/%/)) return "Tolerancia";
    if (unidadLower.match(/°c|°f/)) return "Temperatura";
    if (unidadLower.match(/rpm/)) return "Velocidad";
    if (unidadLower.match(/cfm|m³\/h/)) return "Flujo";
    if (unidadLower.match(/db/)) return "Nivel Sonoro";
    if (unidadLower.match(/mm|cm|inch/)) return "Dimensión";

    return "General";
  };

  const getSpecColor = (specType: string) => {
    const colors: Record<string, string> = {
      Resistencia: "bg-red-100 text-red-800",
      Capacitancia: "bg-blue-100 text-blue-800",
      Voltaje: "bg-yellow-100 text-yellow-800",
      Corriente: "bg-green-100 text-green-800",
      Potencia: "bg-orange-100 text-orange-800",
      Frecuencia: "bg-purple-100 text-purple-800",
      Tolerancia: "bg-gray-100 text-gray-800",
      Temperatura: "bg-cyan-100 text-cyan-800",
      Velocidad: "bg-indigo-100 text-indigo-800",
      Flujo: "bg-teal-100 text-teal-800",
      NivelSonoro: "bg-pink-100 text-pink-800",
      Dimensión: "bg-amber-100 text-amber-800",
      General: "bg-slate-100 text-slate-800",
    };

    return colors[specType] || colors.General;
  };

  const categoryInfo = categoria ? CATEGORIA_SPEC_LABELS[categoria as keyof typeof CATEGORIA_SPEC_LABELS] : null;

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {valorUnidad.map((pair, index) => {
          const specType = getSpecType(pair.unidad);
          return (
            <Badge
              key={index}
              variant="outline"
              className={`${getSpecColor(specType)} text-xs`}
            >
              {formatValorUnidad(pair)}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-orange-600" />
          {categoryInfo?.title || "Especificaciones Técnicas"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {valorUnidad.map((pair, index) => {
            const specType = getSpecType(pair.unidad);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <Badge className={getSpecColor(specType)} variant="outline">
                    {specType}
                  </Badge>
                  <span className="font-medium">{pair.valor}</span>
                </div>
                <span className="text-gray-600 font-mono text-sm">{pair.unidad}</span>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="pt-3 border-t">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Resumen completo:</p>
              <div className="flex flex-wrap gap-2">
                {valorUnidad.map((pair, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {formatValorUnidad(pair)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category-specific notes */}
        {categoryInfo && (
          <div className="pt-3 border-t">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Para componentes tipo {categoryInfo.title.replace("Especificaciones de ", "")},
                estas especificaciones son críticas para la selección y reemplazo correcto.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}