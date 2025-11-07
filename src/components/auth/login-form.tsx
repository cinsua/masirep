"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wrench, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signIn, isLoading, error, isAuthenticated } = useAuth();
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await signIn(email, password);
    if (success) {
      router.push("/dashboard");
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Auto-fill demo credentials for development
  useEffect(() => {
    setEmail("carlos.rodriguez@masirep.com");
    setPassword("temp123");
  }, []);

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Masirep</h1>
        </div>
        <CardTitle className="text-center text-xl">
          Sistema de Repuestos
        </CardTitle>
        <p className="text-center text-muted-foreground text-sm">
          Acceso para técnicos de mantenimiento
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="tu@email.com"
              className={errors.email ? "border-destructive" : ""}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="••••••••"
              className={errors.password ? "border-destructive" : ""}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            Credenciales de desarrollo:
          </p>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <code className="bg-background px-1 rounded text-xs">
                carlos.rodriguez@masirep.com
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contraseña:</span>
              <code className="bg-background px-1 rounded text-xs">temp123</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}