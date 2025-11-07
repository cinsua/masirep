import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

// Force dynamic rendering to avoid build-time static generation issues
export const dynamic = 'force-dynamic';

export default function ReportesPage() {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Módulo de reportes y análisis en construcción...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}