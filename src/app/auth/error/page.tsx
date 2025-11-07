import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering to avoid build-time static generation issues
export const dynamic = 'force-dynamic';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">Error de Autenticación</h1>
          </div>
          <CardTitle className="text-center text-xl">
            Ha ocurrido un problema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Ha ocurrido un error durante la autenticación. Por favor intenta nuevamente.
          </div>

          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar Nuevamente
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                Ir al Inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}