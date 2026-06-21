# Plan de Desarrollo - Financial Analytics Platform

## 📋 Resumen Ejecutivo

Transformar el proyecto actual de monitoreo de acciones básico en una plataforma completa de análisis financiero con múltiples módulos, autenticación, base de datos mejorada y análisis cuantitativo avanzado.

---

## 🎯 Objetivos Principales

1. **Migrar a arquitectura moderna** con Next.js 15 App Router
2. **Implementar autenticación** con Clerk
3. **Mejorar base de datos** con esquemas completos para usuarios, portafolios, watchlists
4. **Crear módulos funcionales**: Dashboard, Mercados, Gráficos, Análisis Cuantitativo, Matriz de Covarianza, Portafolio, Macro Argentina
5. **Implementar análisis cuantitativo** con cálculos de retornos, riesgo, Sharpe Ratio, Beta
6. **Crear interfaz premium** inspirada en TradingView/Bloomberg Terminal
7. **Desplegar en Vercel**

---

## 📊 Análisis del Estado Actual

### ✅ Lo que ya existe:
- Next.js 16.2.4 con App Router
- TypeScript estricto
- TailwindCSS 4
- Base de datos SQLite con libsql
- Drizzle ORM
- Yahoo Finance API integrada
- Componentes básicos: StockCard, StockTable, StockChart, StockSelector
- Hook useStockPoller para polling
- Chatbot básico con Groq API
- Historial de precios

### ❌ Lo que falta:
- Autenticación de usuarios
- Esquema de base de datos completo
- Módulos de dashboard, mercados, gráficos, análisis
- Gestión de portafolios
- Análisis cuantitativo avanzado
- Matriz de correlación
- Macro Argentina
- Diseño premium con tema oscuro
- API de noticias
- API de índices globales

---

## 🗂️ Estructura de Carpetas Propuesta

```
financial-info/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── dollar-market/
│   │   ├── global-indices/
│   │   ├── news-feed/
│   │   └── top-assets/
│   ├── markets/
│   │   ├── page.tsx
│   │   ├── stocks/
│   │   ├── crypto/
│   │   └── bonds/
│   ├── charts/
│   │   ├── page.tsx
│   │   └── [symbol]/
│   ├── analysis/
│   │   ├── page.tsx
│   │   ├── quantitative/
│   │   └── covariance/
│   ├── matrix/
│   │   └── page.tsx
│   ├── portfolio/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   └── new/
│   ├── macro/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # Componentes shadcn/ui
│   ├── dashboard/
│   │   ├── DollarMarketCard.tsx
│   │   ├── GlobalIndicesCard.tsx
│   │   ├── NewsFeedCard.tsx
│   │   └── TopAssetsCard.tsx
│   ├── markets/
│   │   ├── StockTable.tsx
│   │   ├── CryptoTable.tsx
│   │   └── BondTable.tsx
│   ├── charts/
│   │   ├── TradingViewChart.tsx
│   │   ├── CandlestickChart.tsx
│   │   └── TimeframeSelector.tsx
│   ├── analysis/
│   │   ├── ReturnsCalculator.tsx
│   │   ├── RiskMetrics.tsx
│   │   ├── SharpeRatio.tsx
│   │   └── BetaCalculator.tsx
│   ├── portfolio/
│   │   ├── PortfolioCard.tsx
│   │   ├── PositionTable.tsx
│   │   └── AllocationChart.tsx
│   ├── macro/
│   │   ├── InflationCard.tsx
│   │   ├── ReservesCard.tsx
│   │   └── FXGapCard.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── features/
│       ├── StockSelector.tsx
│       ├── StockCard.tsx
│       └── FinanceChatDialog.tsx
├── hooks/
│   ├── useStockPoller.ts
│   ├── useAuth.ts
│   ├── usePortfolio.ts
│   ├── useWatchlist.ts
│   └── useChartData.ts
├── lib/
│   ├── db.ts
│   ├── schema.ts
│   ├── types.ts
│   ├── api/
│   │   ├── stocks.ts
│   │   ├── news.ts
│   │   ├── indices.ts
│   │   ├── macro.ts
│   │   └── portfolio.ts
│   ├── services/
│   │   ├── yahooFinance.ts
│   │   ├── dolarapi.ts
│   │   ├── argenstats.ts
│   │   └── tradingview.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── server/
│       ├── actions.ts
│       └── middleware.ts
├── public/
│   ├── images/
│   └── icons/
├── scripts/
│   ├── init-db.ts
│   ├── backfill-last-month.ts
│   └── migrate-db.ts
├── middleware.ts
├── clerk.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## ✅ Fase 1: Configuración y Autenticación - COMPLETADA

### 1.1 Instalación de Dependencias ✅

```bash
# Auth
npm install @clerk/nextjs

# UI Components
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip

# Charts
npm install recharts @tanstack/react-query zustand lucide-react

# API Clients
npm install axios

# Utilities
npm install date-fns clsx tailwind-merge
```

**Estado:** ✅ Todas las dependencias instaladas exitosamente

### 1.2 Configuración de Clerk ✅

**Archivos creados/modificados:**

1. **middleware.ts** ✅
   - Middleware para proteger rutas
   - Matcher para rutas API y Clerk
   - Rutas protegidas: /dashboard, /markets, /charts, /analysis, /matrix, /portfolio, /macro, /settings

2. **app/sign-in/[[...sign-in]]/page.tsx** ✅
   - Página de login con componente SignIn de Clerk

3. **app/sign-up/[[...sign-up]]/page.tsx** ✅
   - Página de registro con componente SignUp de Clerk

4. **app/layout.tsx** ✅
   - ClerkProvider configurado
   - Navegación con UserButton
   - Metadata actualizada

**Estado:** ✅ Clerk CLI login completado
- Instancia: development (ins_3FAxqUCTgtzFHviIHPOQC7nKWbx)
- App: My Application (app_3FAxqXI14hTEHgh58sOmqEG3wOs)
- Verificación: `clerk doctor` - Todos los checks pasando ✅

### 1.3 Configuración de Estilos ✅

**Archivos creados/modificados:**

1. **app/globals.css** ✅
   - Variables CSS para tema oscuro premium
   - Colores: #0A0E17 (fondo), #111827 (cards), #22C55E (positivo), #EF4444 (negativo)
   - Estilos base y utilidades personalizadas
   - Animaciones: fadeIn, slideUp, pulse

2. **app/layout.tsx** ✅
   - Metadata actualizada
   - Fontes: Inter, Geist, Geist_Mono configuradas

3. **app/components/navigation.tsx** ✅
   - Navegación responsiva con menú hamburguesa
   - Links a todos los módulos
   - UserButton integrado
   - Logo con gradiente

**Estado:** ✅ Tema oscuro premium implementado

---

## 📊 Fase 2: Base de Datos - COMPLETADA ✅

### 2.1 Esquema de Base de Datos ✅

**Archivo: lib/schema.ts**

Crear esquemas completos:

```typescript
// users
- id (PK)
- clerkId (unique)
- email
- name
- createdAt

// portfolios
- id (PK)
- userId (FK)
- name
- description
- createdAt
- updatedAt

// positions
- id (PK)
- portfolioId (FK)
- symbol
- quantity
- averagePrice
- purchaseDate
- createdAt

// watchlists
- id (PK)
- userId (FK)
- name
- createdAt

// watchlistAssets
- id (PK)
- watchlistId (FK)
- symbol
- createdAt

// chartAnnotations
- id (PK)
- userId (FK)
- symbol
- title
- note
- date
- createdAt
```

### 2.2 Relaciones ✅

**Archivo: lib/relations.ts** ✅ (integrado en schema.ts con drizzle relations)

Definir relaciones entre tablas.

### 2.3 Migraciones ✅

**Archivos creados:**

1. ✅ **scripts/migrate-db.ts**
   - Script para generar y aplicar migraciones

2. ✅ **drizzle.config.ts**
   - Configuración de Drizzle

3. ✅ **scripts/init-db.ts**
   - Script para inicializar base de datos con datos de prueba

### 2.4 Actualizar lib/db.ts ✅

- ✅ Importar relaciones
- ✅ Configurar schema completo

---

## 🎨 Fase 3: Componentes UI

### 3.1 Componentes Base (shadcn/ui)

Crear componentes reutilizables:
- Button
- Card
- Input
- Select
- Table
- Tabs
- Dialog
- Toast
- Badge
- Avatar

### 3.2 Componentes de Layout

**Archivos a crear:**

1. **components/layout/Header.tsx**
   - Logo
   - Navegación
   - UserButton
   - Theme toggle

2. **components/layout/Sidebar.tsx**
   - Menú lateral
   - Links a módulos

3. **components/layout/Footer.tsx**
   - Información del footer

### 3.3 Componentes del Dashboard

**Archivos a crear:**

1. **components/dashboard/DollarMarketCard.tsx**
   - Tarjeta para mercado de dólares
   - Datos: Official, Blue, MEP, CCL, Crypto Dollar
   - API: https://dolarapi.com

2. **components/dashboard/GlobalIndicesCard.tsx**
   - Índices: S&P 500, Nasdaq, Dow Jones, MERVAL
   - Mostrar precio y cambio

3. **components/dashboard/NewsFeedCard.tsx**
   - Feed de noticias financieras
   - Thumbnail, headline, timestamp

4. **components/dashboard/TopAssetsCard.tsx**
   - Tabs: US Stocks, Argentina ADRs, Local Market
   - Ticker, nombre, moneda, precio, cambio

### 3.4 Componentes de Mercados

**Archivos a crear:**

1. **components/markets/StockTable.tsx**
   - Tabla de acciones
   - API: Yahoo Finance

2. **components/markets/CryptoTable.tsx**
   - Top 20 criptomonedas
   - Precio, Market Cap, Volume, 24h Change

3. **components/markets/BondTable.tsx**
   - AL30, GD30, AE38

### 3.5 Componentes de Gráficos

**Archivos a crear:**

1. **components/charts/TradingViewChart.tsx**
   - Integración con TradingView Lightweight Charts
   - Gráfico de velas (candlestick)
   - Timeframes: 1D, 1W, 1M, 3M, 6M, 1Y, 3Y, 5Y, MAX

2. **components/charts/CandlestickChart.tsx**
   - Gráfico de velas con Recharts

3. **components/charts/TimeframeSelector.tsx**
   - Selector de timeframe

4. **components/charts/IndicatorsPanel.tsx**
   - Indicadores: SMA 20, SMA 50, SMA 200, EMA 9, EMA 21, Bollinger Bands, RSI, MACD

5. **components/charts/ComparisonPanel.tsx**
   - Comparar hasta 5 activos

6. **components/charts/AnnotationsPanel.tsx**
   - Panel para agregar anotaciones
   - Persistir en base de datos

### 3.6 Componentes de Análisis Cuantitativo

**Archivos a crear:**

1. **components/analysis/ReturnsCalculator.tsx**
   - Inputs: Asset, Start date, End date
   - Cálculos:
     - Log Returns
     - Cumulative Return
     - Annualized Return
   - Fórmula: r_t = ln(P_t / P_{t-1})

2. **components/analysis/RiskMetrics.tsx**
   - Volatilidad histórica
   - Fórmula: σ * sqrt(252)

3. **components/analysis/SharpeRatio.tsx**
   - Fórmula: (Return - Risk Free Rate) / Volatility

4. **components/analysis/BetaCalculator.tsx**
   - Fórmula: Beta = Cov(asset, market) / Var(market)
   - Benchmarks: S&P 500, MERVAL

5. **components/analysis/DrawdownCalculator.tsx**
   - Max Drawdown
   - Recovery Date

### 3.7 Componentes de Matriz de Covarianza

**Archivo a crear:**

1. **components/matrix/CovarianceMatrix.tsx**
   - Inputs: 2-20 assets
   - Cálculos:
     - Covariance Matrix
     - Correlation Matrix
   - Visualización:
     - Heatmap interactivo
     - Hover details
     - Color scale
     - Valores numéricos

### 3.8 Componentes de Portafolio

**Archivos a crear:**

1. **components/portfolio/PortfolioCard.tsx**
   - Valor del portafolio
   - Profit/Loss
   - Allocation

2. **components/portfolio/PositionTable.tsx**
   - Tabla de posiciones
   - CRUD operations

3. **components/portfolio/AllocationChart.tsx**
   - Gráfico de torta (Pie chart)
   - Performance chart

4. **components/portfolio/PortfolioForm.tsx**
   - Formulario para crear/editar portafolio

### 3.9 Componentes de Macro Argentina

**Archivos a crear:**

1. **components/macro/InflationCard.tsx**
   - Inflación
   - API: ArgenStats

2. **components/macro/ReservesCard.tsx**
   - Reservas del BCRA
   - API: ArgenStats

3. **components/macro/FXGapCard.tsx**
   - Gap de divisas
   - API: DolarAPI

4. **components/macro/MacroCharts.tsx**
   - Gráficos históricos interactivos

---

## 🔄 Fase 3: API Routes y CRUD - COMPLETADA ✅

### Existentes (✅)
- ✅ **app/api/stocks/route.ts** — GET lista, POST actualizar
- ✅ **app/api/stocks/history/route.ts** — GET historial (stub, sin data)
- ✅ **app/api/dashboard/route.ts** — GET dashboard stats
- ✅ **app/api/portfolio/route.ts** — CRUD portafolios
- ✅ **app/api/portfolio/[id]/route.ts** — GET/update/delete portafolio
- ✅ **app/api/portfolio/[id]/positions/route.ts** — GET/POST posiciones
- ✅ **app/api/portfolio/[id]/positions/[positionId]/route.ts** — DELETE posición
- ✅ **app/api/watchlists/route.ts** — GET/POST watchlists
- ✅ **app/api/watchlists/[id]/route.ts** — CRUD watchlist + assets
- ✅ **app/api/annotations/route.ts** — CRUD anotaciones
- ✅ **app/api/chat/route.ts** — Chat con Groq API

### Faltantes (❌)
- ❌ **app/api/news/route.ts**
- ❌ **app/api/indices/route.ts**
- ❌ **app/api/macro/route.ts**
- ❌ **app/api/analysis/returns/route.ts**
- ❌ **app/api/analysis/risk/route.ts**
- ❌ **app/api/analysis/sharpe/route.ts**
- ❌ **app/api/analysis/beta/route.ts**
- ❌ **app/api/analysis/drawdown/route.ts**
- ❌ **app/api/matrix/covariance/route.ts**
- ❌ **app/api/charts/[symbol]/route.ts**

## 🧱 Fase 4: Componentes, Servicios y Páginas Restantes

### 4.1 Servicios de API (lib/services/) ✅

| Archivo | Estado |
|---------|--------|
| `lib/services/yahooFinance.ts` | ✅ Creado — fetchQuote, fetchQuotes, fetchHistory, fetchHistoryMonths |
| `lib/services/dolarapi.ts` | ✅ Creado — fetchDolarRates, fetchDolarRate, calculateGap |
| `lib/services/argenstats.ts` | ✅ Creado — fetchInflation, fetchLatestInflation, fetchInflationSummary |
| `lib/services/tradingview.ts` | ✅ Creado — toTVCandlesticks, toTVLine, SMA/EMA/RSI/Bollinger/MACD |

### 4.2 Utilidades (lib/utils/) ✅

| Archivo | Estado |
|---------|--------|
| `lib/utils/calculations.ts` | ✅ Creado — logReturns, simpleReturns, cumulativeReturn, annualizedReturn, volatility, sharpeRatio, beta, covariance, correlation, maxDrawdown, covarianceMatrix, correlationMatrix |
| `lib/utils/formatters.ts` | ✅ Creado — formatCurrency, formatCompactCurrency, formatARS, formatPercent, formatChange, formatCompactNumber, formatDate, formatTimeAgo, formatMarketTime, formatVolume |
| `lib/utils/validators.ts` | ✅ Creado — isValidSymbol, isValidQuantity, isValidPrice, isValidEmail, isValidPortfolioName, sanitizeString, clamp |

### 4.3 Hooks Personalizados (hooks/) ✅

| Archivo | Estado |
|---------|--------|
| `hooks/useAuth.ts` | ✅ Creado — envuelve `useUser` de Clerk |
| `hooks/usePortfolio.ts` | ✅ Creado — CRUD portafolios + posiciones |
| `hooks/useWatchlist.ts` | ✅ Creado — CRUD watchlists + assets |
| `hooks/useChartData.ts` | ✅ Creado — fetch datos históricos por símbolo/timeframe |
| `hooks/useNews.ts` | ✅ Creado — fetch noticias por categoría |
| `hooks/useIndices.ts` | ✅ Creado — fetch índices globales |
| `hooks/useMacro.ts` | ✅ Creado — fetch inflación, reservas, fxGap |

### 4.4 Componentes UI por Módulo ✅

**Layout** (components/layout/):
- ✅ `Sidebar.tsx` — menú lateral con links a todos los módulos
- ✅ `Footer.tsx` — footer informativo
- ✅ `Header` → existe como `app/components/navigation.tsx`

**Dashboard** (components/dashboard/):
- ✅ `DollarMarketCard.tsx` — cotizaciones en vivo desde DolarAPI
- ✅ `GlobalIndicesCard.tsx` — S&P 500, Nasdaq, MERVAL via `/api/indices`
- ✅ `NewsFeedCard.tsx` — feed de noticias via `/api/news`
- ✅ `TopAssetsCard.tsx` — tabs US/ADRs/Local via `/api/stocks`

**Markets** (components/markets/):
- ✅ `CryptoTable.tsx` — top 10 cripto desde CoinGecko
- ✅ `BondTable.tsx` — AL30, GD30, AE38 via `/api/stocks`
- ✅ `StockTable` — existe inline en `app/markets/page.tsx`

**Charts** (components/charts/):
- ✅ `TradingViewChart.tsx` — velas con lightweight-charts
- ✅ `CandlestickChart.tsx` — velas con Recharts
- ✅ `TimeframeSelector.tsx` — 1D/1W/1M/3M/6M/1Y/3Y/5Y/MAX
- ✅ `IndicatorsPanel.tsx` — SMA, EMA, Bollinger, RSI, MACD
- ✅ `ComparisonPanel.tsx` — comparar hasta 5 activos
- ✅ `AnnotationsPanel.tsx` — CRUD persistido en DB

**Analysis** (components/analysis/):
- ✅ `ReturnsCalculator.tsx` — log returns, cumulative, annualized
- ✅ `RiskMetrics.tsx` — volatilidad diaria y anualizada
- ✅ `SharpeRatio.tsx` — Sharpe ratio con tasa libre de riesgo configurable
- ✅ `BetaCalculator.tsx` — beta vs benchmark seleccionable
- ✅ `DrawdownCalculator.tsx` — max drawdown + recuperación

**Matrix** (components/matrix/):
- ✅ `CovarianceMatrix.tsx` — heatmap interactivo covarianza/correlación

**Portfolio** (components/portfolio/):
- ✅ `PortfolioCard.tsx` — valor, P&L, cantidad de posiciones
- ✅ `PositionTable.tsx` — tabla con precios actuales y P&L
- ✅ `AllocationChart.tsx` — pie chart interactivo
- ✅ `PortfolioForm.tsx` — formulario crear/editar portafolio

**Macro** (components/macro/):
- ✅ `InflationCard.tsx` — inflación mensual, YTD, anual
- ✅ `ReservesCard.tsx` — reservas BCRA
- ✅ `FXGapCard.tsx` — brecha oficial vs blue
- ✅ `MacroCharts.tsx` — gráfico histórico inflación (Recharts)

### 4.5 API Routes Faltantes ✅

| Ruta | Estado |
|------|--------|
| `app/api/news/route.ts` | ✅ Creado — fetch noticias via NewsAPI |
| `app/api/indices/route.ts` | ✅ Creado — S&P 500, Nasdaq, Dow Jones, MERVAL via Yahoo Finance |
| `app/api/macro/route.ts` | ✅ Creado — inflación + brecha cambiaria |
| `app/api/analysis/returns/route.ts` | ✅ Creado — log returns, cumulative, annualized |
| `app/api/analysis/risk/route.ts` | ✅ Creado — volatilidad diaria y anualizada |
| `app/api/analysis/sharpe/route.ts` | ✅ Creado — sharpe ratio con riskFreeRate configurable |
| `app/api/analysis/beta/route.ts` | ✅ Creado — beta + correlación vs benchmark |
| `app/api/analysis/drawdown/route.ts` | ✅ Creado — max drawdown con peak/trough/recovery |
| `app/api/matrix/covariance/route.ts` | ✅ Creado — matriz de covarianza + correlación |
| `app/api/charts/[symbol]/route.ts` | ✅ Creado — datos para gráfico por timeframe |

### 4.6 Páginas Stubs → Reales ✅

| Página | Estado |
|--------|--------|
| `app/page.tsx` (dashboard) | ✅ Mejorado — se agregaron DollarMarket, GlobalIndices, NewsFeed |
| `app/charts/page.tsx` | ✅ Reemplazado — TradingViewChart + Indicators + Comparison + Annotations |
| `app/charts/[symbol]/page.tsx` | ✅ Creado — gráfico + anotaciones para un símbolo |
| `app/analysis/page.tsx` | ✅ Reemplazado — Returns/Risk/Sharpe/Beta/Drawdown calculators conectados a API real |
| `app/matrix/page.tsx` | ✅ Reemplazado — CovarianceMatrix con heatmap interactivo |
| `app/macro/page.tsx` | ✅ Reemplazado — InflationCard + ReservesCard + FXGapCard + MacroCharts |
| `app/portfolio/[id]/page.tsx` | ✅ Creado — detalle de portafolio con posiciones, asignación, performance |
| `app/portfolio/new/page.tsx` | ✅ Creado — formulario para crear portafolio |

### 4.7 Server Actions (lib/server/actions.ts)
❌ Pendiente — CRUD portafolio, posiciones, watchlists, anotaciones

---

## 🧪 Fase 5: Testing

### 5.1 Unit Tests
- Utilidades de cálculo
- Formateadores
- Validadores

### 5.2 Integration Tests
- API routes
- Server actions
- Hooks

### 5.3 E2E Tests
- Flujos principales
- Autenticación
- CRUD de portafolios

---

## 🚢 Fase 6: Despliegue

### 6.1 Configuración de Vercel
1. Verificar variables de entorno: DATABASE_URL, LIBSQL_TOKEN, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, GROQ_API_KEY
2. Configurar build: Next.js, TypeScript, TailwindCSS
3. Configurar database: migraciones, seed data
4. Configurar domain: registrar dominio en Clerk, CORS

### 6.2 Scripts de Despliegue
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "db:migrate": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## 📋 Cronograma Actual

### ✅ Fase 1: Configuración y Autenticación — COMPLETADA
**Fecha:** 2025
- ✅ Instalación de dependencias
- ✅ Configuración de Clerk
- ✅ Tema oscuro premium
- ✅ Migración de base de datos inicializada
- ✅ Middleware de protección de rutas
- ✅ Componentes de autenticación
- ✅ clerk doctor — Todos los checks pasando

### ✅ Fase 2: Base de Datos y Esquemas — COMPLETADA
- ✅ schema.ts: users, portfolios, positions, watchlists, chartAnnotations
- ✅ Relaciones Drizzle ORM
- ✅ Migraciones Drizzle (0000 y 0001)
- ✅ drizzle.config.ts, lib/db.ts, lib/relations.ts
- ✅ init-db.ts, migrate-db.ts

### ✅ Fase 3: API Routes y CRUD — COMPLETADA
- ✅ Portfolio CRUD (GET/POST/PUT/DELETE)
- ✅ Watchlists CRUD + asset management
- ✅ Positions CRUD
- ✅ Annotations CRUD
- ✅ Dashboard stats
- ✅ Stocks list + price fetch
- ✅ Chat con Groq API
- ❌ Faltan 10 endpoints (analysis/*, matrix, news, indices, macro, charts/[symbol])

### ⏳ Fase 4: Componentes, Servicios y Páginas
**Estado: En progreso — 4.1 completado ✅**
- 4.1 Servicios de API (4 archivos) ✅
- 4.2 Utilidades (3 archivos) ✅
- 4.3 Hooks (7 archivos) ✅
- 4.4 Componentes UI (25+ archivos) ✅
- 4.5 API routes faltantes (10 endpoints) ✅
- 4.6 Páginas stubs → reales (8 páginas) ✅
- 4.7 Server actions

### ⏳ Fase 5: Testing
**Estado: Pendiente**

### ⏳ Fase 6: Despliegue
**Estado: Pendiente**

---

## 🎯 Métricas de Éxito

1. **Funcionalidad:** Todos los módulos implementados, autenticación funcional, CRUD de portafolios
2. **Rendimiento:** Tiempo de carga < 2s, polling optimizado, caché de datos
3. **Calidad:** TypeScript estricto, código limpio, tests pasando
4. **UX:** Diseño premium, responsive, accesible
5. **Despliegue:** Vercel, Database en Turso, variables de entorno configuradas

---