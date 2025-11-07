"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { NotificationProvider } from "@/components/notifications/notification-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch every 5 minutes
      refetchOnWindowFocus={true}
    >
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </SessionProvider>
  );
}