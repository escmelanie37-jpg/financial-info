"use client";

import Navigation from "@/components/layout/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserButton } from "@clerk/nextjs";
import { User, Shield, Bell } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="text-muted-foreground mt-1">Administrá tu cuenta y preferencias</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <UserButton />
                </div>
                <div>
                  <CardTitle className="text-sm">Cuenta</CardTitle>
                  <p className="text-xs text-muted-foreground">Administrá tu perfil de Clerk</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Usá el botón de usuario en la barra de navegación para acceder a la gestión de cuenta.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm">Seguridad</CardTitle>
                  <p className="text-xs text-muted-foreground">Privacidad y datos</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tus datos se almacenan de forma segura. La autenticación está gestionada por Clerk.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm">Preferencias</CardTitle>
                  <p className="text-xs text-muted-foreground">Personalización</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Más opciones de personalización próximamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
