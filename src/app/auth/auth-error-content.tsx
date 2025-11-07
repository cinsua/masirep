"use client";

import { useSearchParams } from "next/navigation";

export function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "CredentialsSignin":
        return "Credenciales inválidas. Por favor verifica tu email y contraseña.";
      case "AccessDenied":
        return "Acceso denegado. No tienes permisos para acceder.";
      case "Verification":
        return "Error de verificación. Por favor intenta nuevamente.";
      case "Default":
        return "Ha ocurrido un error. Por favor intenta nuevamente.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
        return "Error de conexión. Por favor intenta nuevamente.";
      default:
        return "Ha ocurrido un error inesperado. Por favor contacta al administrador.";
    }
  };

  return (
    <>
      <div className="text-sm text-muted-foreground text-center">
        {getErrorMessage(error)}
      </div>

      {error && (
        <div className="text-xs text-muted-foreground text-center bg-muted p-2 rounded">
          Código de error: {error}
        </div>
      )}
    </>
  );
}