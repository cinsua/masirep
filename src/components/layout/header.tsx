"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Wrench } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function Header() {
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      window.location.href = "/auth/signin";
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wrench className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Masirep</h1>
        </div>

        {session && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {session.user.name}
              </span>
              {session.user.technicianId && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {session.user.technicianId}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isSigningOut ? "Saliendo..." : "Salir"}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}