"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = "/auth/signin"
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push(redirectTo);
    }
  }, [session, status, router, redirectTo]);

  // Show loading state with better UX
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-sm shadow-lg">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <div className="relative">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-foreground">
                Verificando sesión
              </h3>
              <p className="text-sm text-muted-foreground">
                Validando tu identidad...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show unauthorized state briefly before redirect
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-sm shadow-lg">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <div className="p-3 bg-destructive/10 rounded-full">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-foreground">
                Acceso requerido
              </h3>
              <p className="text-sm text-muted-foreground">
                Redirigiendo al inicio de sesión...
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-3/4 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}