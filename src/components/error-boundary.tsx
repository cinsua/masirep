"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;

      if (Fallback) {
        return <Fallback error={this.state.error} reset={() => this.reset()} />;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">Error Inesperado</h1>
            </div>

            <p className="text-muted-foreground mb-6">
              Ha ocurrido un error inesperado en la aplicación.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer mb-2">
                  Ver detalles del error
                </summary>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <Button
              onClick={() => this.reset()}
              className="flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reintentar</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private reset() {
    this.setState({ hasError: false, error: undefined });
  }
}

export function AuthErrorFallback({ reset }: { error?: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Error de Autenticación</h1>
        </div>

        <p className="text-muted-foreground mb-6">
          Ha ocurrido un error en el sistema de autenticación. Por favor intenta nuevamente.
        </p>

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reintentar</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.href = "/auth/signin"}
            className="w-full"
          >
            Ir a Login
          </Button>
        </div>
      </div>
    </div>
  );
}