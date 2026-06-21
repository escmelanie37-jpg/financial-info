"use client";

import { useRouter } from "next/navigation";
import Navigation from "@/components/layout/navigation";
import { PortfolioForm } from "@/components/portfolio/PortfolioForm";
import { ArrowLeft } from "lucide-react";

export default function NewPortfolioPage() {
  const router = useRouter();

  const handleSubmit = async (name: string, description: string) => {
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        router.push("/portfolio");
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push("/portfolio")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nuevo Portafolio</h1>
          <p className="text-muted-foreground mt-1">Creá un nuevo portafolio de inversión</p>
        </div>

        <div className="max-w-md">
          <PortfolioForm onSubmit={handleSubmit} onCancel={() => router.push("/portfolio")} />
        </div>
      </main>
    </div>
  );
}
