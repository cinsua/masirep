"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <div
      {...createDebugAttributes({
        componentName: 'Providers',
        filePath: 'src/components/providers/session-provider.tsx'
      })}
    >
      <SessionProvider
        refetchInterval={5 * 60} // Refetch every 5 minutes
        refetchOnWindowFocus={true}
      >
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </SessionProvider>
    </div>
  );
}