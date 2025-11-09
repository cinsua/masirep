"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, AlertCircle } from "lucide-react";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface ValorUnidadPair {
  valor: string;
  unidad: string;
}

interface ValueUnitPairManagerProps {
  value: ValorUnidadPair[];
  onChange: (value: ValorUnidadPair[]) => void;
  categoria?: string;
  disabled?: boolean;
}

// Suggested units by category
const UNIDADES_SUGERIDAS = {
  RESISTENCIA: ["Ω", "kΩ", "MΩ", "W", "%", "ppm"],
  CAPACITOR: ["pF", "nF", "µF", "mF", "F", "V", " tolerance"],
  INTEGRADO: ["pines", "MHz", "V", "mA", "W", "package", "temp"],
  VENTILADOR: ["V", "mA", "RPM", "CFM", "dB", "mm"],
  OTROS: [],
};

const COMMON_UNITS = ["V", "A", "W", "Hz", "Ω", "F", "H", "m", "mm", "°C", "%"];

export function ValueUnitPairManager({
  value,
  onChange,
  categoria,
  disabled = false
}: ValueUnitPairManagerProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const addPair = () => {
    const newPairs = [...value, { valor: "", unidad: "" }];
    onChange(newPairs);
    setFocusedIndex(newPairs.length - 1);
  };

  const removePair = (index: number) => {
    const newPairs = value.filter((_, i) => i !== index);
    onChange(newPairs);
    if (focusedIndex === index) {
      setFocusedIndex(null);
    }
  };

  const updatePair = (index: number, field: "valor" | "unidad", newValue: string) => {
    const newPairs = [...value];
    newPairs[index] = { ...newPairs[index], [field]: newValue };
    onChange(newPairs);
  };

  const getSuggestedUnits = () => {
    if (categoria && categoria in UNIDADES_SUGERIDAS) {
      return UNIDADES_SUGERIDAS[categoria as keyof typeof UNIDADES_SUGERIDAS];
    }
    return COMMON_UNITS;
  };

  const getValidationMessage = (pair: ValorUnidadPair) => {
    if (!pair.valor && !pair.unidad) return "";
    if (!pair.valor) return "El valor es requerido";
    if (!pair.unidad) return "La unidad es requerida";
    return "";
  };

  const isValidPair = (pair: ValorUnidadPair) => {
    return pair.valor.trim() !== "" && pair.unidad.trim() !== "";
  };

  const validPairs = value.filter(isValidPair);

  return (
    <Card {...createDebugAttributes({
      componentName: 'ValueUnitPairManager',
      filePath: 'src/components/forms/value-unit-pair-manager.tsx'
    })}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Especificaciones Técnicas</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPair}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </div>
        {validPairs.length === 0 && (
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            Debe agregar al menos una especificación técnica completa
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {value.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay especificaciones agregadas. Haga clic en "Agregar" para añadir.
          </p>
        ) : (
          value.map((pair, index) => {
            const validationMessage = getValidationMessage(pair);
            const isValid = isValidPair(pair);
            const isFocused = focusedIndex === index;

            return (
              <div
                key={index}
                className={`border rounded-lg p-4 space-y-3 ${
                  isFocused ? "border-orange-300 bg-orange-50" : "border-gray-200"
                } ${!isValid && (pair.valor || pair.unidad) ? "border-red-200 bg-red-50" : ""}`}
              >
                <div className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`valor-${index}`} className="text-sm">
                          Valor *
                        </Label>
                        <Input
                          id={`valor-${index}`}
                          value={pair.valor}
                          onChange={(e) => updatePair(index, "valor", e.target.value)}
                          onFocus={() => setFocusedIndex(index)}
                          onBlur={() => setFocusedIndex(null)}
                          placeholder="ej: 1K, 100, 5V"
                          disabled={disabled}
                          className={validationMessage && !pair.valor ? "border-red-300" : ""}
                        />
                      </div>

                      <div className="flex-1">
                        <Label htmlFor={`unidad-${index}`} className="text-sm">
                          Unidad *
                        </Label>
                        <div className="relative">
                          <Input
                            id={`unidad-${index}`}
                            value={pair.unidad}
                            onChange={(e) => updatePair(index, "unidad", e.target.value)}
                            onFocus={() => setFocusedIndex(index)}
                            onBlur={() => setFocusedIndex(null)}
                            placeholder="ej: Ω, µF, V"
                            disabled={disabled}
                            className={validationMessage && !pair.unidad ? "border-red-300" : ""}
                          />

                          {/* Quick suggestions */}
                          {isFocused && getSuggestedUnits().length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                              <div className="p-2">
                                <p className="text-xs text-gray-500 mb-2">Sugerencias:</p>
                                <div className="flex flex-wrap gap-1">
                                  {getSuggestedUnits().map((unit) => (
                                    <Badge
                                      key={unit}
                                      variant="outline"
                                      className="cursor-pointer text-xs"
                                      onClick={() => updatePair(index, "unidad", unit)}
                                    >
                                      {unit}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {validationMessage && (
                      <p className="text-sm text-red-600">{validationMessage}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePair(index)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 mt-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Preview */}
                {isValid && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="text-sm text-gray-600">Vista previa:</span>
                    <Badge variant="outline">
                      {pair.valor} {pair.unidad}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Summary */}
        {validPairs.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Resumen:</span>
              <div className="flex flex-wrap gap-1">
                {validPairs.map((pair, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {pair.valor} {pair.unidad}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}