import { signIn, signOut, getSession, getProviders } from "next-auth/react";
import type { Session } from "next-auth";

interface AuthClientOptions {
  /**
   * Enable debug mode
   * @default false
   */
  debug?: boolean;
  /**
   * Base URL for the authentication endpoints
   */
  baseUrl?: string;
}

const DEFAULT_OPTIONS: AuthClientOptions = {
  debug: false,
  baseUrl: "/api/auth",
};

class AuthClient {
  private options: AuthClientOptions;

  constructor(options: AuthClientOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Sign in with credentials
   */
  async signIn(
    credentials?: { email: string; password: string },
    redirectUrl?: string
  ): Promise<{ ok: boolean; error?: string; url?: string }> {
    try {
      const result = await signIn("credentials", {
        ...credentials,
        redirect: false,
        callbackUrl: redirectUrl || "/dashboard",
      });

      if (result?.error) {
        this.log("error", "Sign in error:", result.error);
        return { ok: false, error: result.error };
      }

      if (result?.ok) {
        this.log("info", "Sign in successful");
        return { ok: true, url: result.url || undefined };
      }

      return { ok: false, error: "Unknown error occurred" };
    } catch (error) {
      this.log("error", "Sign in exception:", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Network error occurred"
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(options?: { redirect?: boolean }): Promise<{ ok: boolean; error?: string }> {
    try {
      await signOut({ redirect: false });
      this.log("info", "Sign out successful");
      return { ok: true };
    } catch (error) {
      this.log("error", "Sign out exception:", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Network error occurred"
      };
    }
  }

  /**
   * Get the current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const session = await getSession();
      this.log("debug", "Session retrieved:", !!session);
      return session;
    } catch (error) {
      this.log("error", "Get session exception:", error);
      return null;
    }
  }

  /**
   * Get available authentication providers
   */
  async getProviders() {
    try {
      const providers = await getProviders();
      this.log("debug", "Providers retrieved:", Object.keys(providers || {}));
      return providers;
    } catch (error) {
      this.log("error", "Get providers exception:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return !!session;
    } catch {
      return false;
    }
  }

  /**
   * Enhanced error handling wrapper for auth operations
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    fallback?: T
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.log("error", "Operation failed:", error);
      return fallback ?? null;
    }
  }

  private log(level: "info" | "error" | "debug", message: string, ...args: unknown[]) {
    if (this.options.debug || level === "error") {
      const prefix = `[AuthClient]`;
      switch (level) {
        case "info":
          console.info(prefix, message, ...args);
          break;
        case "error":
          console.error(prefix, message, ...args);
          break;
        case "debug":
          if (this.options.debug) {
            console.debug(prefix, message, ...args);
          }
          break;
      }
    }
  }
}

// Export singleton instance
export const authClient = new AuthClient({ debug: false });

// Export types
export type { Session };