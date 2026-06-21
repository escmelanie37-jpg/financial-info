"use client";

import Navigation from "@/components/layout/navigation";
import { InflationCard } from "@/components/macro/InflationCard";
import { ReservesCard } from "@/components/macro/ReservesCard";
import { FXGapCard } from "@/components/macro/FXGapCard";
import { MacroCharts } from "@/components/macro/MacroCharts";

export default function MacroPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Macroeconomía</h1>
          <p className="text-muted-foreground mt-1">Datos macroeconómicos de Argentina</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <InflationCard />
          <ReservesCard />
          <FXGapCard />
        </div>

        <MacroCharts />
      </main>
    </div>
  );
}
