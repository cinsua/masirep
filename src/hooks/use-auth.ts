import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { authClient } from "@/lib/auth-client";

interface UseAuthReturn {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = status === "authenticated";

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn(
        { email, password },
        "/dashboard"
      );

      if (!result.ok) {
        setError(
          result.error === "CredentialsSignin"
            ? "Credenciales inválidas"
            : "Error al iniciar sesión"
        );
        return false;
      }

      return true;
    } catch (err) {
      setError("Error de conexión. Por favor intenta nuevamente.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      window.location.href = "/auth/signin";
    } catch (err) {
      setError("Error al cerrar sesión");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      await authClient.getSession();
    } catch (err) {
      setError("Error al refrescar la sesión");
    }
  }, []);

  // Clear errors when session changes
  useEffect(() => {
    if (session && error) {
      setError(null);
    }
  }, [session, error]);

  return {
    session,
    isLoading: isLoading || status === "loading",
    isAuthenticated,
    error,
    signIn,
    signOut,
    refreshSession,
  };
}