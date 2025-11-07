'use client'

import React from 'react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl text-foreground">
            Error Inesperado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Ha ocurrido un error inesperado en la aplicación.
            Por favor, intenta recargar la página.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted/50 rounded-lg p-3 text-left">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Error details (development mode):
              </p>
              <p className="text-xs text-destructive font-mono break-words">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-1">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              onClick={reset}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/auth/signin'}
              className="w-full"
            >
              Ir al Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}