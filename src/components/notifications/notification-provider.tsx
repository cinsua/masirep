"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { RepuestoValidationError } from "@/lib/validations/repuesto";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  showError: (error: RepuestoValidationError | string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showError = useCallback((error: RepuestoValidationError | string, title = "Error") => {
    const message = typeof error === "string" ? error : error.message;
    addNotification({
      type: "error",
      title,
      message,
      duration: 8000, // Errors stay longer
    });
  }, [addNotification]);

  const showSuccess = useCallback((message: string, title = "Éxito") => {
    addNotification({
      type: "success",
      title,
      message,
      duration: 4000,
    });
  }, [addNotification]);

  const showWarning = useCallback((message: string, title = "Advertencia") => {
    addNotification({
      type: "warning",
      title,
      message,
      duration: 6000,
    });
  }, [addNotification]);

  const showInfo = useCallback((message: string, title = "Información") => {
    addNotification({
      type: "info",
      title,
      message,
      duration: 5000,
    });
  }, [addNotification]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onClose 
}: { 
  notification: Notification; 
  onClose: () => void; 
}) {
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertVariant = () => {
    switch (notification.type) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      case "warning":
        return "default";
      case "info":
        return "default";
    }
  };

  return (
    <Alert variant={getAlertVariant() as any} className="relative pr-12">
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <div className="font-medium">{notification.title}</div>
          {notification.message && (
            <AlertDescription className="mt-1">
              {notification.message}
            </AlertDescription>
          )}
          {notification.action && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={notification.action.onClick}
                className="h-7 text-xs"
              >
                {notification.action.label}
              </Button>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}