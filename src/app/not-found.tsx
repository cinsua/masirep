"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">
            Página No Encontrada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            La página que estás buscando no existe o ha sido movida.
          </p>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Ir al Dashboard
              </Link>
            </Button>

            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver Atrás
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}