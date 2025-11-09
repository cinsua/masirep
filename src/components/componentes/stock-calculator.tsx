"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calculator, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { ComponenteWithRelations } from "@/types/api";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface StockCalculatorProps {
  componente: ComponenteWithRelations;
  className?: string;
}

export function StockCalculator({ componente, className = "" }: StockCalculatorProps) {
  const totalStock = componente.ubicaciones.reduce((sum, ub) => sum + ub.cantidad, 0);
  const stockMinimo = componente.stockMinimo;
  const stockPercentage = stockMinimo > 0 ? (totalStock / stockMinimo) * 100 : 100;

  const getStockStatus = () => {
    if (totalStock === 0) {
      return {
        label: "Sin Stock",
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
        progressColor: "bg-red-500",
      };
    } else if (totalStock <= stockMinimo) {
      return {
        label: "Stock Crítico",
        color: "bg-orange-100 text-orange-800",
        icon: AlertTriangle,
        progressColor: "bg-orange-500",
      };
    } else if (totalStock <= stockMinimo * 1.5) {
      return {
        label: "Stock Bajo",
        color: "bg-yellow-100 text-yellow-800",
        icon: Package,
        progressColor: "bg-yellow-500",
      };
    } else {
      return {
        label: "Stock Óptimo",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        progressColor: "bg-green-500",
      };
    }
  };

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;

return (
    <Card className={className} {...createDebugAttributes({componentName: 'StockCalculator', filePath: 'src/components/componentes/stock-calculator.tsx'})}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-orange-600" />
          Cálculo de Stock
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stock Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-6 w-6 text-orange-600" />
            <div>
              <div className="font-semibold text-lg">{totalStock} unidades</div>
              <div className="text-sm text-gray-600">Stock actual</div>
            </div>
          </div>
          <Badge className={stockStatus.color}>
            {stockStatus.label}
          </Badge>
        </div>

        {/* Progress Bar */}
        {stockMinimo > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Nivel de stock</span>
              <span>{Math.round(stockPercentage)}% del mínimo</span>
            </div>
            <Progress
              value={Math.min(stockPercentage, 100)}
              className="h-3"
            />
          </div>
        )}

        {/* Stock Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-sm text-gray-600">Stock Mínimo</div>
            <div className="font-semibold">{stockMinimo} unidades</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Diferencia</div>
            <div className={`font-semibold ${totalStock >= stockMinimo ? 'text-green-600' : 'text-red-600'}`}>
              {totalStock >= stockMinimo ? '+' : ''}{totalStock - stockMinimo} unidades
            </div>
          </div>
        </div>

        {/* Location Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium">Desglose por Ubicación</h4>
          {componente.ubicaciones.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-3">
              No hay ubicaciones asignadas
            </p>
          ) : (
            <div className="space-y-2">
              {componente.ubicaciones.map((ubicacion, index) => {
                const percentage = totalStock > 0 ? (ubicacion.cantidad / totalStock) * 100 : 0;
                return (
                  <div
                    key={ubicacion.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {ubicacion.cajoncito.codigo}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {ubicacion.cantidad} unidades
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {ubicacion.cajoncito.nombre}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                      <Progress value={percentage} className="h-2 w-20" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Recomendaciones</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {totalStock === 0 && (
              <li>• Se necesita reponer stock urgentemente</li>
            )}
            {totalStock > 0 && totalStock <= stockMinimo && (
              <li>• El stock está por debajo del mínimo recomendado</li>
            )}
            {totalStock > stockMinimo && totalStock <= stockMinimo * 1.5 && (
              <li>• Considerar reponer stock pronto para evitar shortages</li>
            )}
            {totalStock > stockMinimo * 1.5 && (
              <li>• El nivel de stock es adecuado</li>
            )}
            {componente.ubicaciones.length === 0 && (
              <li>• Asignar ubicaciones de almacenamiento para tracking de stock</li>
            )}
            {componente.ubicaciones.length > 1 && (
              <li>• Considerar consolidar stock para optimizar el inventario</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}